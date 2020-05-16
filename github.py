#!/usr/bin/env python
# coding: utf-8
import requests as rq


def getInfo(user):
    url = f"https://api.github.com/users/{user}"
    userInfo = rq.get(url).json()

    ghInfo = {}
    shortInfo = {}

    if not 'message' in userInfo:
        ghInfo['Name'] = userInfo['name']
        ghInfo['Login'] = userInfo['login']
        ghInfo['Location'] = userInfo['location']
        ghInfo['Email'] = userInfo['email']
        ghInfo['Company'] = userInfo['company']
        ghInfo['Bio'] = userInfo['bio']
        ghInfo['Type'] = userInfo['type']
        ghInfo['Hireable'] = userInfo['hireable']
        ghInfo['Created at'] = userInfo['created_at']
        ghInfo['Updated at'] = userInfo['updated_at']

        shortInfo['Followers'] = userInfo['followers']
        shortInfo['Following'] = userInfo['following']
        shortInfo['PublicRepos'] = userInfo['public_repos']
        shortInfo['PublicGists'] = userInfo['public_gists']

        return ghInfo, shortInfo, userInfo['avatar_url']
    else:
        return {'Name': "NoInfo"}, {'Rank': 'NoInfo'}, "NoInfo"
