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
            print(type(problems1))
            print(problems1)
            print(problems2)
            common_problems = problems1.intersection(problems2)
            print(common_problems)

            # print(user1, user2)
            # print(ccInfo1)
            # print(ccInfo2)
            # print(image1)
            # print(image2)
            # print(star_bgcolor1, star_bgcolor2)
            # print(ccRank1)
            # print(ccRank2)

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

            print(user)
            print(ccInfo)
            print(ccRank)
            print(image)
            print(shortrank)
            print(star_bgcolor)
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
        return render_template("input.html")


@app.route("/codeforces/", methods=["POST", "GET"])
def codeforces():
    if request.method == "POST":
        user1 = request.form["user1"]
        user2 = request.form["user2"]

        cfInfo1, cfRank1, cfTitlePhoto1 = cf.getInfo(user1)
        cfInfo2, cfRank2, cfTitlePhoto2 = cf.getInfo(user2)
        print(user1, user2)
        print(cfInfo1)
        print(cfInfo2)

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
        return render_template("input.html")

@app.route("/github/", methods=["POST", "GET"])
def github():
    if request.method == "POST":
        user1 = request.form["user1"]
        user2 = request.form["user2"]

        ghInfo1, shortInfo1, ghAvatar1 = gh.getInfo(user1)
        ghInfo2, shortInfo2, ghAvatar2 = gh.getInfo(user2)
        print(user1, user2)
        print(ghInfo1)
        print(ghInfo2)

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
        return render_template("input.html")


    #     new_task = Todo(content=task_content)

    #     try:
    #         db.session.add(new_task)
    #         db.session.commit()
    #         return redirect('/')
    #     except:
    #         return 'Unable to Add'
    # else:
    # #     tasks = Todo.query.order_by(Todo.date_created).all()
    # #     # print(tasks)
    #     return "ERROR"
    # return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)
