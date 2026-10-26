#!/usr/bin/env python
# coding: utf-8

import requests as rq
import json

def getInfo(user):
    page = rq.get(f'https://codeforces.com/api/user.info?handles={user}')
    if page.status_code==200:
        userInfo = json.loads(page.content.decode())['result'][0]

        cfInfo = {}
        cfRank = {'Contribution': 'NA',
        'Rating': 'NA',
        'Max Rating': 'NA',
        'Rank': 'NA',
        'Max Rank': 'NA'}

        for x in range(len(userInfo)):
            if (not 'Name' in cfInfo) or (('firstName' or 'lastName') in cfInfo):
                if ('firstName' and 'lastName') in userInfo:
                    cfInfo['Name'] = userInfo['firstName']+" "+userInfo['lastName']
                elif 'firstName' in userInfo:
                    cfInfo['FirstName'] = userInfo['firstName']
                    cfInfo['LastName'] = "NA"
                elif 'lastName' in userInfo:
                    cfInfo['FirstName'] = "NA"
                    cfInfo['LastName'] = userInfo['lastName']
                else:
                    cfInfo['Name'] = "NA"
                    
            cfInfo['Handle'] = userInfo['handle']
            if not 'Country' in cfInfo:
                if 'country' in userInfo:cfInfo['Country']=userInfo['country']
            if not 'City' in cfInfo:
                if 'city' in userInfo:cfInfo['City']=userInfo['city']
            if not 'Organization' in cfInfo:
                if 'organization' in userInfo:cfInfo['Organization']=userInfo['organization']
            
            cfInfo['Friends']=userInfo['friendOfCount']
            cfInfo['Registered Time']=userInfo['registrationTimeSeconds']
            cfInfo['Last Online']=userInfo['lastOnlineTimeSeconds']
            # cfInfo['TitlePhoto']=userInfo['titlePhoto']
            
            if 'contribution' in userInfo:cfRank['Contribution']=userInfo['contribution']          
            if 'rating' in userInfo:cfRank['Rating']=userInfo['rating']
            if 'maxRating' in userInfo:cfRank['Max Rating']=userInfo['maxRating']
            if 'rank' in userInfo:cfRank['Rank']=userInfo['rank']
            if 'maxRank' in userInfo:cfRank['Max Rank']=userInfo['maxRank']

        return cfInfo, cfRank, userInfo['titlePhoto']

    else:
        return {'Name': "NoInfo"}, {'Rank':'NoInfo'}, "NoInfo"
