# WISDOM
(**W**idespread **I**ntelligent **S**ystem for **D**omain **O**utlier **M**onitoring)

WISDOM uses scipy's implementation of Kernel Density Estimation (KDE) to build density estimates for daily counts of weapon ads faceted by weapon type and city (both extracted using NER from crawled weapons data). Daily counts that have low densities are flagged as anomalous and indicated in the interface by a pulsing red circle. Density cutoff for an anomaly can be adjusted by user in interface.

![alt tag](https://github.com/khundman/MEMEX-WISDOM/blob/master/screenshots/main.png)

By hovering over circles, density estimates, histograms, and trends for given location/weapon combos can be visualized in a d3 tooltip. The most recent day's count (used for anomaly evaluation) and anomaly status is indicated by a vertical line through the desnity estimate. 

![alt tag](https://github.com/khundman/MEMEX-WISDOM/blob/master/screenshots/tooltip.png)

### Notes on data
- For this prototype, ads found on days between 9-20-15 and 10-19-15 were queried as this was the primary period when data was crawled by the Memex Weapons team.
- Not all weapon type / city combos have been included
- Kernel densities have been manually inflated due to limited data (less data -> less certainty about distribution -> low densities)

### Setup
* [Solr] - Data in Solr index containing crawled weapons data
* anomaly-pre.py - Python script used to make aggregation queries from Solr index and pre-process density estimates 
* [map.js] - draw d3-based world map using [Topojson] and add circles according to json data generated from anomaly-pre.py. Map building based on http://bost.ocks.org/mike/map/ and  http://www.tnoda.com/blog/2013-12-07
* When circles are hovered, functions called from [time-series.js] and [kde.js] to draw on d3 tooltip
* Buttons for weapons types drawn in [button.js] using [Bootstrap] styling
* Served using [Flask]

### To-Dos and Ideas
- Allow user to set time window (if more crawl data becomes available)
- Allow analysis by country as well as by city
- U.S.-only interface
- Make eastern seaboard cities less congested in viz
- Scale weapons buttons to hundreds of selections
- Evaluate performance around known weapon events



   [Solr]: <http://lucene.apache.org/solr/>
   [map.js]: <https://github.com/khundman/MEMEX-WISDOM/blob/master/static/geo/map.js>
   [anomaly-pre.py]: <http://imagecat.dyndns.org/solr/imagecatdev/>
   [Topojson]: <https://github.com/mbostock/topojson>
   [time-series.js]: <https://github.com/khundman/MEMEX-WISDOM/blob/master/static/time-series.js>
   [kde.js]: <https://github.com/khundman/MEMEX-WISDOM/blob/master/static/kde.js>
   [button.js]: <https://github.com/khundman/MEMEX-WISDOM/blob/master/static/buttons.js>
   [Bootstrap]: <http://getbootstrap.com/>
   [Flask]: <http://flask.pocoo.org/> 