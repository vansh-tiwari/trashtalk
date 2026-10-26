#!/usr/bin/env python
# coding: utf-8

from bs4 import BeautifulSoup as bs
import requests as rq


def getInfo(user):
    # user = "vanshtiwari"
    # user = input()
    url = "https://www.codechef.com/users/" + user
    print(url)
    page = rq.get(url)
    print(f'response code: {page.status_code}')
    soup = bs(page.content, "html5lib")
    infoTag = soup.find("main", attrs={"class": "content"})

    userInfo = {}

    try:
        image = infoTag.header.img.attrs["src"]
        if image[0] == "/":
            image = "https://www.codechef.com" + image

        userInfo["Name"] = infoTag.div.contents[1][3:]

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

        prbTag = infoTag.contents[4].contents[3].contents[1].contents[1].contents[1].contents[15]
        prbList = prbTag.find_all("a")
        solved = prbTag.find_all("h5")
        fullSolved = solved[0].text.split(' ')[-1][1:-1]
        parSolved = solved[1].text.split(' ')[-1][1:-1]
        totalSolved = str(int(fullSolved)+int(parSolved))
        prbSolved = [fullSolved, parSolved, totalSolved]
        problems = set()
        for prob in prbList:
            problems.add(prob.text)
        # rateTag = soup.find("div", attrs={"class": "widget pl0 pr0 widget-rating"})
        rateTag = rateTag = infoTag.contents[4].aside.contents[1]
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

        rankList = []
        for ranks in rank:
            try:
                contestRank = [details.text for details in ranks.find_all('td')]
                rankList.append(contestRank)
            except AttributeError as e:
                # AttributeError as each detail doesn't has <td>..</td>
                continue
        # print(rankList)

        return image, userInfo, rankList, shortrank, star_bgcolor, problems, prbSolved

    except Exception as e:
        print(e)
        # print("Username not found")
        star_bgcolor = "background-color:#6AA"
        image = "https://www.dstech.net/images/easyblog_shared/November_2018/11-12-18/human_error_stop_400.png"
        return image, {'Name': "NoInfo"}, [user, "NoRank","Found"], ["NoRankInfo"], star_bgcolor, {'NoInfo'}, ['NoInfo']

