import codechef as cc
import codeforces as cf
import github as gh

username = input("Enter username: ")

#cc: Codechef
ccInfo, ccRank = cc.getInfo(username)

#cf: Codeforces
cfInfo = cf.getInfo(username)

#gh: Github
ghInfo = gh.getInfo(username)

try:
    print("Codechef Info".upper())
    for x in ccInfo:
        print(x, ccInfo[x])

    for x in range(3):
        print(ccRank[x])
    print()
    
except:
    print("Username not found")

try:
    print("Codeforces Info".upper())
    for x in cfInfo:
        print("{}: {}".format(x, cfInfo[x]))
except:
    "Username not found"

try:
    print("Github Info".upper())
    for x in ghInfo:
        print("{}: {}".format(x, ghInfo[x]))
except:
    "Username not found"

