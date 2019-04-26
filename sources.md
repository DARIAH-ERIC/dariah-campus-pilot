---
layout: default
title: Sources
---



<div class="uk-section">

  <div class="uk-container uk-container-xsmall">

    <h1 class="uk-article-title uk-text-center">{{ page.title | escape }}</h1>

    <p class="uk-text-center uk-text-lead">DARIAH learning resources don't all live in one place. Here you can explore our materials based on the context in which they were produced.</p>

    <div class="uk-margin-medium-top">

    {% for source in site.data.sources%}
    {% assign href = "/sources/" | append: source.name %}

    <div class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-grid">
        <div class="uk-card-media-left uk-cover-container">
            <img src="{{source.img | relative_url }}" alt="" uk-cover/>
            <canvas width="{{source.canvas_width}}" height="{{source.canvas_height}}"></canvas>
        </div>
        <div>

            <div class="uk-card-body">
  <h3 class="uk-card-title"><a class="uk-link-heading" href="{{href | relative_url}}">{{source.name}}</a></h3>
                <p>{{source.descr}}</p>
<a href="{{href | relative_url}}" class="uk-button uk-button-text">{{ site.data.translation[site.lang].read_more | default: "Read more" }} &rarr;</a>
            </div>




        </div>
    </div>

    {% endfor %}


  </div>











  </div>

</div>
