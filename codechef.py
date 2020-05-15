#!/usr/bin/env python
# coding: utf-8

from bs4 import BeautifulSoup as bs
import requests as rq


def getInfo(user):
    # user = "vanshtiwari"
    # user = input()
    url = "https://www.codechef.com/users/" + user
    page = rq.get(url)
    soup = bs(page.content, "html5lib")
    infoTag = soup.find("main", attrs={"class": "content"})
    # rankData = {'LongChallenge':{'Rating':0, 'GlobalRank':0, 'CountryRank':0},
    #             'Cook-off':{'Rating':0, 'GlobalRank':0, 'CountryRank':0},
    #             'LunchTime':{'Rating':0, 'GlobalRank':0, 'CountryRank':0},
    #            }
    userInfo = {}
    rankList = [["0" for x in range(4)] for y in range(3)]

    try:
        image = infoTag.header.img.attrs["src"]
        if image[0] == "/":
            image = "https://www.codechef.com" + image
        name = infoTag.div.contents[1][3:]
        userInfo["Name"] = infoTag.div.contents[1][3:]
        #     print("Name:", name)
        for i in range(1, len(infoTag.section.ul) - 2, 2):
            key = infoTag.section.ul.contents[i].label.text[:-1]
            value = infoTag.section.ul.contents[i].span.text
            if key == "Username":
                userInfo[key] = value[2:]
                userInfo["Star"] = value[0:2]
            elif key=="Country":
                userInfo[key] = value[2:]
            else:
                userInfo[key] = infoTag.section.ul.contents[i].span.text

        prbTag = infoTag.contents[4].contents[3].contents[1].contents[1].contents[1].contents[18]
        prbList = prbTag.find_all("a")
        solved = prbTag.find_all("h5")
        fullSolved = solved[0].text.split(' ')[-1][1:-1]
        parSolved = solved[1].text.split(' ')[-1][1:-1]
        totalSolved = str(int(solved[0].text.split(' ')[-1][1:-1])+int(solved[1].text.split(' ')[-1][1:-1]))
        prbSolved = [fullSolved, parSolved, totalSolved]
        problems = set()
        for x in prbList:
            problems.add(x.text)
        # rateTag = soup.find("div", attrs={"class": "widget pl0 pr0 widget-rating"})
        rateTag = rateTag=infoTag.contents[4].aside.contents[1]
        star_bgcolor = rateTag.span.attrs['style']

        conRate = rateTag.div.contents[6].div.contents
        conTable = conRate[1].contents[1]

        rating = rateTag.div.contents[1].contents[1].text
        highest = rateTag.div.contents[1].contents[7].text[1:-1].split(" ")[-1]
        allrate = rateTag.div.contents[4]

        globalrank = allrate.ul.contents[1].a.text
        countryrank = allrate.ul.contents[3].a.text
        shortrank = [rating, highest, globalrank, countryrank]

        rank = conRate[1].tbody.contents
        rankTitle = conTable.contents[1].contents
        m, n = 0, 0
        for i in range(0, len(rank) - 2, 2):
            a = conRate[1].tbody.contents[i]
            for x in range(1, len(a.contents), 2):
                #         print(a.contents[x].text, x, type(a.contents[x].text))
                #         print(a.contents[1].text)
                #         print(rankTitle[x].text)
                #         rankData[a.contents[1].text][rankTitle[x].text] = a.contents[x].text
                rankList[m][n] = a.contents[x].text
                n += 1
            m += 1
            n = 0
        return image, userInfo, rankList, shortrank, star_bgcolor, problems, prbSolved

    except Exception as e:
        print(e)
        # print("Username not found")
        star_bgcolor = "background-color:#6AA"
        image = "https://www.dstech.net/images/easyblog_shared/November_2018/11-12-18/human_error_stop_400.png"
        return image, {'Name': "NoInfo"}, [user, "NoRank","Found"], ["NoRankInfo"], star_bgcolor, {'NoInfo'}, ['NoInfo']

    # print(rankList)
    # for x in range(3):
    #     print(rankList[x])

    # for x in userInfo:
    #     print(x, userInfo[x])
    # return userInfo, rankList
