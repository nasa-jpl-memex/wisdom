import urllib2
from urllib2 import *
import contextlib
import os
import time
import sys
import collections
import json
import numpy as np
import geopy
from geopy.geocoders import GoogleV3
import scipy.stats as stats
from boto.s3.connection import S3Connection
from boto.s3.key import Key

passman = urllib2.HTTPPasswordMgrWithDefaultRealm()
index_url = 'http://imagecat.dyndns.org/solr/imagecatdev/'
passman.add_password(None, index_url, os.environ["MEMEX_USER"], os.environ["MEMEX_PASS"])
urllib2.install_opener(urllib2.build_opener(urllib2.HTTPBasicAuthHandler(passman)))


def get_unique(url, field_name, include_cnt=False):  
    req = urllib2.Request(url)
    with_cnt = json.loads(urllib2.urlopen(req).read())["facet_counts"]["facet_fields"][field_name] 
    no_cnt = [] #don't need counts that come back
    [no_cnt.append(x) for i, x in enumerate(with_cnt) if i % 2 == 0]
    return no_cnt
        

def get_counts(url):
    req = urllib2.Request(url)
    return json.loads(urllib2.urlopen(req, timeout=10).read())['facet_counts']['facet_dates']['lastModified']


#query for unique cities with limit on results
unique_locs = get_unique(
                    index_url + 
                    'select?q=*:*' +
                    '&rows=0' +
                    '&wt=json' +
                    '&indent=true' +
                    '&facet=on' +
                    '&facet.field=cities' +
                    '&facet.limit=750', 
                    "cities" #field
                )

#query for unique weapon types with limit on results
unique_types = get_unique(
                    index_url + 
                    'select?q=*:*' +
                    '&rows=0' +
                    '&wt=json' +
                    '&indent=true' +
                    '&facet=on' +
                    '&facet.field=ner_weapon_type_ts_md' +
                    '&facet.limit=30', 
                    "ner_weapon_type_ts_md" #field
                )

#loop through unique locations (cities) adn weapon_types, run KDE for each combo, build json object to be put in s3
results = []
cnt = 1
for loc in unique_locs:
    print str(cnt) + " out of 1000 - " + loc
    cnt += 1

    # convert city to coordinates
    tries = 5
    #if request fails, try up to 5 times
    while tries >= 0:
        try:
            geolocator = GoogleV3()
            global location 
            location = geolocator.geocode(loc)
            tries = 0
            break 
        except:
            tries -= 1
            continue
    
    #deal with encoding issues later
    try:
        loc.encode('utf-8')
    except:
        continue
    
    if location != None and location != "":
        for weapon_type in unique_types:
            result = {}
    #         if loc == "Los Angeles" and weapon_type.lower() == "gun" : #DELETE WHEN READY - USE FOR TESTING
            try:
                result = get_counts(
                        index_url + 
                        'select?q=%s:"%s"' %("cities",loc.replace(" ","%20").replace(",","%2C")) + #remove spaces from uri
                        '+AND+%s:"%s"' %("ner_weapon_type_ts_md",weapon_type.replace(" ","%20").replace(",","%2C")) +
                        '&rows=0' +
                        '&wt=json' +
                        '&indent=true' +
                        '&facet=true' +
                        '&facet.date=lastModified' +
                        '&facet.date.start=2015-09-20T00:00:01Z' + 
                        '&facet.date.end=2015-10-20T23:59:59Z' +
                        '&facet.date.gap=%2B1DAY' +
                        '&group=true' +
                        '&group.field=lastModified' +
                        '&group.facet=true' +
                        '&timeAllowed=10000')
            except:
                print "solr query issue"

            #dictionary of {day: count}
            if bool(result) != False:
                group = {}
                vals, time_units = [], []
                for key,value in sorted(result.iteritems()):
                    if key != "start" and key != "gap" and key != "end":
                        vals.append(value)
                        time_units.append(key)


                #scipy implementation of KDE (bandwidth automatically selected)
                #--------------------------
                try:
                    kd = stats.gaussian_kde(vals)
                    estimates = kd.evaluate(vals)
                #--------------------------

                    group['result'] = {}
                    group['result']['location'] = loc 
                    group['result']['weapon_type'] = weapon_type
                    group['result']["cnt"] = vals
                    group['result']["day"] = time_units
                    group['result']["kde"] = estimates.tolist()
                    group['result']["lat"] = location.latitude
                    group['result']["lon"] = location.longitude

                    results.append(group)
                except:
                    print "error with loc and weapon: " + str(loc) + "_" + str(weapon_type)


with open(os.path.dirname(os.path.realpath(__file__)) + "/kde.json", "w") as out:
    out.write(json.dumps(results))

