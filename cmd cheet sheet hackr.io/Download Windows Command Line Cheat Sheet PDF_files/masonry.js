let partnerMasonry = null;
// create inline
let jobbio_masonry = {
  widget: function (params) {
    let script = document.getElementById('jobbio-masonry-script');
    let container = params.container;
    let slug = params.slug;
    let page_size = params.count;
    let type = params.type;
    let content = params.content;
    let searchTerm = params.searchTerm || '';
    let api = ''

    for (let param in params) {
        params[param] = encodeURIComponent(params[param]);
    }

    let blockedPartners = []

    if(blockedPartners.includes(slug)){
      return
    }

    params = Object.keys(params).reduce(function (r, x) {return r + x + '=' + params[x] + '&';}, '').slice(0, -1);

    let url = script.getAttribute('src').replace("/partner_fluid_widgets_v1.5/masonry.js", "");
    if(url === "https://d3g4doi210g6ib.cloudfront.net"){
      api = "https://api.jobbiodev.com"
    }else if(url === "https://d1pywsqd87ew9v.cloudfront.net"){
      api = "https://partner-api.jobbio.com"
    }else if(url.includes("jobbio.")){
      api = url.replace("widgets.", "partner-api.");
    }else{
      api = url.replace("widgets.", "api.");
    }

    let stylesheet_1 = `<link id="stlsht" rel="stylesheet" href="${url}/partner_fluid_widgets_v1.5/assets/css/v3.min.css">`;
    let brand = '<style type="text/css" id="brand-colour"></style>';
    let tracking = `<script id="clktrk">
                      function trkclk(source){
                        var data = {
                          source: source
                        };
                        (function ($) {
                          $.ajax({
                            type: "POST", 
                            contentType: "application/json; charset=utf-8", 
                            url: '${api}/clicks', 
                            data:JSON.stringify(data), 
                          });
                        }(jQuery));
                      };
                      function trkrdt(job_id, source, redirecting, redirect_link){
                        if(redirecting){
                          var data = {
                            job_id: job_id,
                            source: source,
                            link: redirect_link
                          };
                          (function ($) {
                            $.ajax({
                              type: "POST", 
                              contentType: "application/json; charset=utf-8", 
                              url: '${api}/jobs/redirect', 
                              data:JSON.stringify(data), 
                            });
                          }(jQuery));
                        }
                      };
                    </script>`;
    (function ($) {
      if(!document.getElementById('stlsht')){
        $(stylesheet_1).appendTo('head');
      }
      if(!document.getElementById('brand-colour')){
        $(brand).appendTo('head');
      }
      if(!document.getElementById('clktrk')){
        $(tracking).appendTo('body');
      }
    }(jQuery));

    init(api, slug);

    (function ($) {
      if(type === 'multiple' && content === 'jobs'){
        $.ajax({url: `${api}/channels/${slug}/feed?search=${searchTerm}&page_size=${page_size}&source=${slug}_masonry_jobs_widget&widgets=true&page=${document.location.href}`, success: function(jobs){
            loadMasonryJobs(jobs, container, partnerMasonry, `${slug}_masonry_jobs_widget`);
          }});
      }else if(type === 'multiple' && content === 'companies'){
        $.ajax({url: `${api}/channels/${slug}/featured-companies?page_size=${page_size}&featured=true&source=${slug}_masonry_companies_widget&widgets=true`, success: function(companies){
            loadMasonryCompanies(companies, container, partnerMasonry, `${slug}_masonry_companies_widget`);
          }});
      }else if(type === 'multiple' && content === 'articles'){
        $.ajax({url: `${api}/articles?channel=${slug}&source=${slug}&page_size=${page_size}&source=${slug}_masonry_articles_widget&widgets=true`, success: function(articles){
            loadMasonryArticles(articles, container, partnerMasonry, `${slug}_masonry_articles_widget`);
          }});
      }
    }(jQuery));
  }
};
function init(api, slug) {
  (function ($) {
    $.ajax({url: `${api}/channels/${slug}?widgets=true`, success: function(response){
      let channel = response;
      $("#brand-colour").append(`
        .btn--primary,
        .btn--primary:visited,
        .btn--primary:hover{
          background-color: ${channel.colour} !important;
          border-color: ${channel.colour} !important;
        }
        .jobbioapp a:hover{
          color: ${channel.colour} !important;
        }
        .jobbioapp .fluid-v13 .list.v2 .item:hover::before {
          background-color: ${channel.colour} !important;
        }  
      `);
      partnerMasonry = channel
    }, async: false});
  }(jQuery));
}

function loadMasonryJobs(jobs, container, partner, source){
  (function ($) {
    $("#"+container).append(
      `<div class="fluid-v13">
        <div class="masonry horizontal job multiple">          
          <div class="list v1 v2" id="masonry-job-multiple"></div>
        </div>
      </div>`
    );
    for(let job in jobs){
      let link = jobs[job].redirect ?
        getTrackingLink(jobs[job].redirect, partner) :
        partner.routes.job_url.replace("[company]", jobs[job].company.slug).replace("[job]", jobs[job].slug)
      $("#masonry-job-multiple").append(
        `
        <div class="h-item">
          <a href="${link}" class="item" style="background-image:url(${jobs[job].company.image_card})" target='_blank' onclick="trkclk('${source}');trkrdt(${jobs[job].id},'${source+'_redirect'}',${!!jobs[job].redirect},'${link}')">
            <img class="v3" src="${jobs[job].company.image_logo}">
            <div class="r1">${jobs[job].title}</div>
            <div class="r2 pt-4 fw-6">${jobs[job].company.name} - ${jobs[job].location.city || jobs[job].location.state || jobs[job].location.country || jobs[job].location.address}</div>
          </a>
        </div>`
      );
    }
  }(jQuery));
}

function loadMasonryCompanies(companies, container, partner, source){
  (function ($) {
    $("#"+container).append(
      `<div class="fluid-v13">
        <div class="masonry horizontal company multiple">          
          <div class="list v1 v2" id="masonry-company-multiple"></div>
        </div>
      </div>`
    );
    companies.map(company => {
      let cta = 'View Company';
      if(company.live_jobs > 0){
        cta = `View ${company.live_jobs} Jobs`
      }
      let link = partner.routes.company_url.replace("[company]", company.slug)
      $("#masonry-company-multiple").append(
        `<div class="h-item">
          <a href="${link}" class="item" style="background-image:url(${company.image_card})" target='_blank' onclick="trkclk('${source}')">
            <img class="v3" src="${company.image_logo}">
            <div class="r1 fw-6">${company.name}</div>
            <div class="r2 pt-4">${company.location.city || company.location.state || company.location.country || company.location.address}</div>
            <div class="r3 pt-4">${cta}</div>
          </a>
        </div>`
      );
    })
  }(jQuery));
}

function loadMasonryArticles(articles, container, partner, source){
  let dateOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  (function ($) {
    $("#"+container).append(
      `<div class="fluid-v13">
        <div class="masonry horizontal article multiple">          
          <div class="list v1 v2" id="masonry-article-multiple"></div>
        </div>
      </div>`
    );
    articles.map(article => {
      let link = partner.routes.article_url.replace("[article]", article.slug)
      $("#masonry-article-multiple").append(
        `<div class="h-item">
          <a href="${link}" class="item pl-20" style="background-image:url(${article.image})" target='_blank' onclick="trkclk('${source}')">
            <div class="r1 fw-6 fs-16">${article.title}</div>
            <div class="r2 pt-4">${article.description}</div>
          </a>
        </div>`
      )
    })
  }(jQuery));
}

function getTrackingLink(url, partner) {
  return url
}

function setIndeedImpressionImage(url){
  return `<img className="indeed-tmn-pxl" data-src="${url}" width="1" height="1" style={{display: 'block', marginBottom:-1}} />`
}