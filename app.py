from flask import Flask, redirect, render_template, url_for, request

# from flask_sqlalchemy import SQLAlchemy
# from datetime import datetime
import codechef as cc
import codeforces as cf
import github as gh

app = Flask(__name__)


@app.route("/", methods=["POST", "GET"])
def index():
    return render_template("index.html")


@app.route("/codechef/", methods=["POST", "GET"])
def codechef():
    urlRule = str(request.url_rule)
    if request.method == "POST":
        try:
            user1 = request.form["user1"]
            user2 = request.form["user2"]

            (
                image1,
                ccInfo1,
                ccRank1,
                shortrank1,
                star_bgcolor1,
                problems1,
                prbSolved1,
            ) = cc.getInfo(user1)
            (
                image2,
                ccInfo2,
                ccRank2,
                shortrank2,
                star_bgcolor2,
                problems2,
                prbSolved2,
            ) = cc.getInfo(user2)

            common_problems = problems1.intersection(problems2)

            if ccInfo1["Name"] == "NoInfo" and ccInfo2["Name"] == "NoInfo":
                return render_template("notfound.html", user1=user1, user2=user2)

            else:
                return render_template(
                    "codechef.html",
                    ccInfo1=ccInfo1,
                    ccInfo2=ccInfo2,
                    ccRank1=ccRank1,
                    ccRank2=ccRank2,
                    image1=image1,
                    image2=image2,
                    shortrank1=shortrank1,
                    shortrank2=shortrank2,
                    star_bgcolor1=star_bgcolor1,
                    star_bgcolor2=star_bgcolor2,
                    problems1=problems1,
                    problems2=problems2,
                    common_problems=common_problems,
                    prbSolved1=prbSolved1,
                    prbSolved2=prbSolved2,
                )
        except:
            user = request.form["user"]
            (
                image,
                ccInfo,
                ccRank,
                shortrank,
                star_bgcolor,
                problems,
                prbSolved,
            ) = cc.getInfo(user)

            return render_template(
                "codechef_profile.html",
                ccInfo=ccInfo,
                ccRank=ccRank,
                image=image,
                shortrank=shortrank,
                star_bgcolor=star_bgcolor,
                problems=problems,
                prbSolved=prbSolved,
            )

    else:
        return render_template("input.html", urlRule = urlRule)


@app.route("/codeforces/", methods=["POST", "GET"])
def codeforces():

    urlRule = str(request.url_rule)
    if request.method == "POST":
        user1 = request.form["user1"]
        user2 = request.form["user2"]

        cfInfo1, cfRank1, cfTitlePhoto1 = cf.getInfo(user1)
        cfInfo2, cfRank2, cfTitlePhoto2 = cf.getInfo(user2)

        return render_template(
            "codeforces.html",
            cfInfo1=cfInfo1,
            cfInfo2=cfInfo2,
            cfRank1=cfRank1,
            cfRank2=cfRank2,
            cfTitlePhoto1=cfTitlePhoto1,
            cfTitlePhoto2=cfTitlePhoto2,
        )
    else:
        return render_template("input.html", urlRule=urlRule)


@app.route("/github/", methods=["POST", "GET"])
def github():

    urlRule = str(request.url_rule)
    if request.method == "POST":
        user1 = request.form["user1"]
        user2 = request.form["user2"]

        ghInfo1, shortInfo1, ghAvatar1 = gh.getInfo(user1)
        ghInfo2, shortInfo2, ghAvatar2 = gh.getInfo(user2)

        return render_template(
            "github.html",
            ghInfo1=ghInfo1,
            ghInfo2=ghInfo2,
            shortInfo1=shortInfo1,
            shortInfo2=shortInfo2,
            ghAvatar1=ghAvatar1,
            ghAvatar2=ghAvatar2,
        )
    else:
        return render_template("input.html", urlRule=urlRule)


if __name__ == "__main__":
    app.run(debug=True)
