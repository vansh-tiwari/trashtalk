import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGithubEvidence, mapRepoToSolvedProblem } from "@/lib/platforms/github";
import { GithubRepo } from "@/lib/platforms/contracts";

describe("GitHub Platform Ingestion Adapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps a public repository to a SolvedProblem trophy with stars as rating and language as tag", () => {
    const mockRepo: GithubRepo = {
      id: "12345",
      name: "redis",
      fullName: "antirez/redis",
      description: "Redis in-memory database",
      url: "https://github.com/antirez/redis",
      stars: 65000,
      forks: 23000,
      language: "C",
      isFork: false,
      updatedAt: "2026-10-01T00:00:00Z",
      createdAt: "2009-03-21T00:00:00Z",
    };

    const problem = mapRepoToSolvedProblem(mockRepo);
    expect(problem.id).toBe("GH:redis");
    expect(problem.platform).toBe("github");
    expect(problem.name).toBe("redis");
    expect(problem.rating).toBe(65000);
    expect(problem.difficulty).toBe("Hard");
    expect(problem.tags).toContain("C");
    expect(problem.tags).toContain("original");
    expect(problem.url).toBe("https://github.com/antirez/redis");
  });

  it("fetches and constructs valid GithubEvidence from mocked API responses", async () => {
    const mockUser = {
      login: "torvalds",
      name: "Linus Torvalds",
      avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
      bio: "Creator of Linux and Git",
      company: "Linux Foundation",
      location: "Portland, OR",
      blog: "https://kernel.org",
      public_repos: 6,
      public_gists: 0,
      followers: 215000,
      following: 0,
      created_at: "2011-09-03T15:26:22Z",
    };

    const mockRepos = [
      {
        id: 2325298,
        name: "linux",
        full_name: "torvalds/linux",
        description: "Linux kernel source tree",
        html_url: "https://github.com/torvalds/linux",
        stargazers_count: 180000,
        forks_count: 53000,
        language: "C",
        fork: false,
        updated_at: "2026-10-28T12:00:00Z",
        created_at: "2011-09-04T22:48:12Z",
      },
      {
        id: 999999,
        name: "some-fork",
        full_name: "torvalds/some-fork",
        description: "A fork",
        html_url: "https://github.com/torvalds/some-fork",
        stargazers_count: 10000,
        forks_count: 50,
        language: "Python",
        fork: true, // Should be excluded from totalOriginalStars
        updated_at: "2026-10-20T12:00:00Z",
        created_at: "2020-01-01T00:00:00Z",
      },
    ];

    const mockEvents = [
      {
        id: "1",
        type: "PushEvent",
        created_at: "2026-10-27T10:00:00Z",
      },
      {
        id: "2",
        type: "PushEvent",
        created_at: "2026-10-26T10:00:00Z",
      },
    ];

    vi.spyOn(global, "fetch").mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.endsWith("/users/torvalds")) {
        return Promise.resolve(new Response(JSON.stringify(mockUser), { status: 200 }));
      }
      if (urlStr.includes("/users/torvalds/repos")) {
        return Promise.resolve(new Response(JSON.stringify(mockRepos), { status: 200 }));
      }
      if (urlStr.includes("/users/torvalds/events/public")) {
        return Promise.resolve(new Response(JSON.stringify(mockEvents), { status: 200 }));
      }
      return Promise.resolve(new Response("Not found", { status: 404 }));
    });

    const evidence = await fetchGithubEvidence("torvalds");
    expect(evidence.status).toBe("ok");
    expect(evidence.handle).toBe("torvalds");
    expect(evidence.profile?.displayName).toBe("Linus Torvalds");
    expect(evidence.profile?.totalStars).toBe(180000); // Only original repo stars
    expect(evidence.profile?.totalForks).toBe(53000);
    expect(evidence.recentContributions).toBe(2);
    expect(evidence.solvedProblems).toHaveLength(1); // Only non-fork repos as trophies
    expect(evidence.solvedProblems?.[0].name).toBe("linux");
  });

  it("handles 404 for non-existent GitHub users", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }));
    });

    const evidence = await fetchGithubEvidence("non_existent_gh_user_xyz123");
    expect(evidence.status).toBe("not_found");
    expect(evidence.error).toContain("not found");
  });

  it("handles 403 rate limits gracefully", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({ message: "API rate limit exceeded" }),
          {
            status: 403,
            headers: { "x-ratelimit-remaining": "0" },
          }
        )
      );
    });

    const evidence = await fetchGithubEvidence("someuser");
    expect(evidence.status).toBe("rate_limited");
    expect(evidence.error).toContain("Rate limit exceeded");
  });
});
