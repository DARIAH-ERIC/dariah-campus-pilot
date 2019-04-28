#!/usr/bin/env python

'''
tag_generator.py

Copyright 2017 Long Qian
Contact: lqian8@jhu.edu

This script creates tags for your Jekyll blog hosted by Github page.
No plugins required.

Adopted by TT to include multiple posts directories for DARIAH-CAMPUS
'''

import glob
import os

posts = ['resources/_posts/**/*md', '_events/**/*md']
tag_dir = 'tags/'

total_tags = []
for path in posts:
    for filename in glob.glob(path, recursive="True"):
        f = open(filename, 'r', encoding='utf8')
        crawl = False
        for line in f:
            if crawl:
                current_tags = line.strip().split()
                if current_tags[0] == 'tags:':
                    total_tags.extend(current_tags[1:])
                    crawl = False
                    break
            if line.strip() == '---':
                if not crawl:
                    crawl = True
                else:
                    crawl = False
                    break
        f.close()
total_tags = set(total_tags)

old_tags = glob.glob(tag_dir + '*.md')
for tag in old_tags:
    os.remove(tag)

if not os.path.exists(tag_dir):
    os.makedirs(tag_dir)

for tag in total_tags:
    tag_filename = tag_dir + tag + '.md'
    f = open(tag_filename, 'a')
    write_str = '---\nlayout: tagpage\ntitle: \"Tag: ' + tag + '\"\ntag: ' + tag + '\nrobots: noindex\n---\n'
    f.write(write_str)
    f.close()
print("Tags generated, count", total_tags.__len__())
