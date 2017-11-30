<template>
  <div id="app">
    <div class="row">
      <div class="col-md-6">
        <h2>Basic Demo</h2>
        <div>
          <div>
            <div>
                <vue-query-builder :rules="basicDemoRules"
                :maxDepth="2"
                :initialQuery="basicDemoInitialQuery"
                @queryUpdated="basicDemoQueryUpdated"
                :labels="basicLabels"
                ></vue-query-builder>
              </div>
            </div>
          </div>
      </div>
      <div class="col-md-6">
      <h2>Output</h2>
      <p>The component outputs the following JSON, which you can use in your app's back end to generate some kind of report or output.</p>
      <pre><code id="basic-demo-output" class="language-json"></code></pre>
    </div>
    </div>
  </div>
</div>
</template>

<script>
import VueQueryBuilder from 'vue-query-builder';
import RangeInput from './RangeInput';
import Vue from 'vue'
var must = []
var should = []
var must2 = []
var should2 = []

export default {
  name: 'app',

  components: {
    VueQueryBuilder
  },
  methods: {
    basicDemoQueryUpdated (query) {
      console.log("query...",query)
      var elastic_query = this.convertToElastic(query)
      console.log("elastic_query...................",elastic_query)
      this.basicDemoQuery = elastic_query;

    Vue.nextTick(function () {
      var basicDemoOutput = document.getElementById('basic-demo-output');
      console.log("++++++++++",basicDemoOutput)
      basicDemoOutput.innerHTML = JSON.stringify(elastic_query, null, 2);
      document.dispatchEvent( new Event('rerender-prism') );
    });
  },
  createQuery(query,children,type,i){
    var selectedOperand = children.query.selectedOperand
    var value = children.query.value
    if(children.query.selectedOperator == "equals"){
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
        must.push({"term":{}})
        must[i]["term"][selectedOperand] = value
      }
      else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
        should.push({"term":{}})
        should[i]["term"][selectedOperand] = value
      }
      else if(type == "query-builder-group" && query.logicalOperator == "All"){
        must2.push({"term":{}})
        must2[i]["term"][selectedOperand] = value
      }
      else if(type == "query-builder-group" && query.logicalOperator == "Any"){
        should2.push({"term":{}})
        should2[i]["term"][selectedOperand] = value
      }
    }
    else if(children.query.selectedOperator == "contains"){
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
        must.push({"match":{}})
        must[i]["match"][selectedOperand] = value
     }
     else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
       should.push({"match":{}})
       should[i]["match"][selectedOperand] = value
     }
     else if(type == "query-builder-group" && query.logicalOperator == "All"){
       must2.push({"match":{}})
       must2[i]["match"][selectedOperand] = value
     }
     else if(type == "query-builder-group" && query.logicalOperator == "Any"){
       should2.push({"match":{}})
       should2[i]["match"][selectedOperand] = value
     }
    }
    else if(children.query.selectedOperator == "does not contain"){
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
        must.push({"bool":{"must_not":[{ "match":{}}] }})
        must[i]["bool"]["must_not"][0]["match"][selectedOperand] = value
     }
     else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
       should.push({"bool":{"must_not":[{ "match":{}}] }})
       should[i]["bool"]["must_not"][0]["match"][selectedOperand] = value
     }
     else if(type == "query-builder-group" && query.logicalOperator == "All"){
       must2.push({"bool":{"must_not":[{ "match":{}}] }})
       must2[i]["bool"]["must_not"][0]["match"][selectedOperand] = value
     }
     else if(type == "query-builder-group" && query.logicalOperator == "Any"){
       should2.push({"bool":{"must_not":[{ "match":{}}] }})
       should2[i]["bool"]["must_not"][0]["match"][selectedOperand] = value
     }
    }
    else if(children.query.selectedOperator == "is empty"){
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
        must.push({ "bool":{"must_not":[{"exists":{}}]}})
        must[i]["bool"]["must_not"][0]["exists"]["field"] = selectedOperand
      }
      else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
        should.push({ "bool":{"must_not":[{"exists":{}}]}})
        should[i]["bool"]["must_not"][0]["exists"]["field"] = selectedOperand
      }
      else if(type == "query-builder-group" && query.logicalOperator == "All"){
        must2.push({ "bool":{"must_not":[{"exists":{}}]}})
        must2[i]["bool"]["must_not"][0]["exists"]["field"] = selectedOperand
      }
      else if(type == "query-builder-group" && query.logicalOperator == "Any"){
        should2.push({ "bool":{"must_not":[{"exists":{}}]}})
        should2[i]["bool"]["must_not"][0]["exists"]["field"] = selectedOperand
      }
  }
    else if(children.query.selectedOperator == "is not empty"){
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
        must.push({"exists":{}})
        must[i]["exists"]["field"] = selectedOperand
     }
     else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
       should.push({"exists":{}})
       should[i]["exists"]["field"] = selectedOperand
     }
     else if(type == "query-builder-group" && query.logicalOperator == "All"){
       must2.push({"exists":{}})
       must2[i]["exists"]["field"] = selectedOperand
     }
     else if(type == "query-builder-group" && query.logicalOperator == "Any"){
       should2.push({"exists":{}})
       should2[i]["exists"]["field"] = selectedOperand
     }
    }
    else if(children.query.selectedOperator == "begins with"){
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
        must.push({"prefix":{}})
        must[i]["prefix"][selectedOperand] = value
     }
     else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
       should.push({"prefix":{}})
       should[i]["prefix"][selectedOperand] = value
    }
      else if(type == "query-builder-group" && query.logicalOperator == "All"){
        must2.push({"prefix":{}})
        must2[i]["prefix"][selectedOperand] = value
     }
     else if(type == "query-builder-group" && query.logicalOperator == "Any"){
       should2.push({"prefix":{}})
       should2[i]["prefix"][selectedOperand] = value
    }
  }
    else if(children.query.selectedOperator == "ends with"){
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
      must.push({"wildcard":{}})
      must[i]["wildcard"][selectedOperand] = "*" + value
     }
     else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
       should.push({"wildcard":{}})
       should[i]["wildcard"][selectedOperand] = "*" + value
    }
    else if(type == "query-builder-group" && query.logicalOperator == "All"){
      must2.push({"wildcard":{}})
      must2[i]["wildcard"][selectedOperand] = "*" + value
   }
   else if(type == "query-builder-group" && query.logicalOperator == "Any"){
     should2.push({"wildcard":{}})
     should2[i]["wildcard"][selectedOperand] = "*" + value
  }
    }
  else if(children.query.selectedOperator == "exact match"){
    if(type == "query-builder-rule" && query.logicalOperator == "All"){
    must.push({"match_phrase":{}})
    must[i]["match_phrase"][selectedOperand] =  value
   }
   else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
     should.push({"match_phrase":{}})
     should[i]["match_phrase"][selectedOperand] =  value
  }
  else if(type == "query-builder-group" && query.logicalOperator == "All"){
    must2.push({"match_phrase":{}})
    must2[i]["match_phrase"][selectedOperand] =  value
 }
 else if(type == "query-builder-group" && query.logicalOperator == "Any"){
   should2.push({"match_phrase":{}})
   should2[i]["match_phrase"][selectedOperand] =  value
}
  }
  else if(children.query.selectedOperator == "match phrase prefix"){
    if(type == "query-builder-rule" && query.logicalOperator == "All"){
    must.push({"match_phrase_prefix":{}})
    must[i]["match_phrase_prefix"][selectedOperand] =  value
   }
   else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
     should.push({"match_phrase_prefix":{}})
     should[i]["match_phrase_prefix"][selectedOperand] =  value
  }
  else if(type == "query-builder-group" && query.logicalOperator == "All"){
    must2.push({"match_phrase_prefix":{}})
    must2[i]["match_phrase_prefix"][selectedOperand] =  value
 }
 else if(type == "query-builder-group" && query.logicalOperator == "Any"){
   should2.push({"match_phrase_prefix":{}})
   should2[i]["match_phrase_prefix"][selectedOperand] =  value
}
  }
  else if(children.query.selectedOperand == "Price"){
    var selectedOperator = children.query.selectedOperator
    if(type == "query-builder-rule" && (selectedOperator == 'gt' || selectedOperator == 'lt' ||selectedOperator == 'gte' || selectedOperator == 'lte') && query.logicalOperator == "All"){
      must.push({"range":{}})
      must[i]["range"] = {}
      must[i]["range"][selectedOperand] = {}
      must[i]["range"][selectedOperand][selectedOperator] =  value
   }
   else if(type == "query-builder-rule" && selectedOperator == 'gt & lt' && query.logicalOperator == "All"){
     must.push({"range":{}})
     must[i]["range"] = {}
     must[i]["range"][selectedOperand] = {}
     must[i]["range"][selectedOperand]['lt'] =  value
     must[i]["range"][selectedOperand]['gt'] =  0
    }
  else if(type == "query-builder-rule" && selectedOperator == 'gte & lte' && query.logicalOperator == "All"){
    must.push({"range":{}})
    must[i]["range"] = {}
    must[i]["range"][selectedOperand] = {}
    must[i]["range"][selectedOperand]['lte'] =  value
    must[i]["range"][selectedOperand]['gte'] =  0
 }
 else if(type == "query-builder-rule" && selectedOperator == 'gt & lte' && query.logicalOperator == "All"){
   must.push({"range":{}})
   must[i]["range"] = {}
   must[i]["range"][selectedOperand] = {}
   must[i]["range"][selectedOperand]['lte'] = value
   must[i]["range"][selectedOperand]['gt'] =  0
}
else if(type == "query-builder-rule" && selectedOperator == 'gte & lt' && query.logicalOperator == "All"){
  must.push({"range":{}})
  must[i]["range"] = {}
  must[i]["range"][selectedOperand] = {}
  must[i]["range"][selectedOperand]['lt'] =  value
  must[i]["range"][selectedOperand]['gte'] =  0
}
else if(type == "query-builder-rule" && (selectedOperator == 'gt' || selectedOperator == 'lt' || selectedOperator == 'gte' || selectedOperator == 'lte') && query.logicalOperator == "Any"){
   should.push({"range":{}})
   should[i]["range"] = {}
   should[i]["range"][selectedOperand] = {}
   should[i]["range"][selectedOperand][selectedOperator] =  value
}
else if(type == "query-builder-rule" && selectedOperator == 'gt & lt' && query.logicalOperator == "Any"){
  should.push({"range":{}})
  should[i]["range"] = {}
  should[i]["range"][selectedOperand] = {}
  should[i]["range"][selectedOperand]['lt'] =  value
  should[i]["range"][selectedOperand]['gt'] =  0
}
else if(type == "query-builder-rule" && selectedOperator == 'gte & lte' && query.logicalOperator == "Any"){
 should.push({"range":{}})
 should[i]["range"] = {}
 should[i]["range"][selectedOperand] = {}
 should[i]["range"][selectedOperand]['lte'] =  value
 should[i]["range"][selectedOperand]['gte'] =  0
}
else if(type == "query-builder-rule" && selectedOperator == 'gt & lte' && query.logicalOperator == "Any"){
  should.push({"range":{}})
  should[i]["range"] = {}
  should[i]["range"][selectedOperand] = {}
  should[i]["range"][selectedOperand]['lte'] =  value
  should[i]["range"][selectedOperand]['gt'] =  0
}
else if(type == "query-builder-rule" && selectedOperator == 'gte & lt' && query.logicalOperator == "Any"){
  should.push({"range":{}})
  should[i]["range"] = {}
  should[i]["range"][selectedOperand] = {}
  should[i]["range"][selectedOperand]['lt'] =  value
  should[i]["range"][selectedOperand]['gte'] =  0
}
else if(type == "query-builder-group" && (selectedOperator == 'gt' || selectedOperator == 'lt' ||selectedOperator == 'gte' || selectedOperator == 'lte') && query.logicalOperator == "All"){
  must2.push({"range":{}})
  must2[i]["range"] = {}
  must2[i]["range"][selectedOperand] = {}
  must2[i]["range"][selectedOperand][selectedOperator] =  value
}
else if(type == "query-builder-group" && selectedOperator == 'gt & lt' && query.logicalOperator == "All"){
   must2.push({"range":{}})
   must2[i]["range"] = {}
   must2[i]["range"][selectedOperand] = {}
   must2[i]["range"][selectedOperand]['lt'] =  value
   must2[i]["range"][selectedOperand]['gt'] =  0
}
else if(type == "query-builder-group" && selectedOperator == 'gte & lte' && query.logicalOperator == "All"){
  must2.push({"range":{}})
  must2[i]["range"] = {}
  must2[i]["range"][selectedOperand] = {}
  must2[i]["range"][selectedOperand]['lte'] =  value
  must2[i]["range"][selectedOperand]['gte'] =  0
}
else if(type == "query-builder-group" && selectedOperator == 'gt & lte' && query.logicalOperator == "All"){
  must2.push({"range":{}})
  must2[i]["range"] = {}
  must2[i]["range"][selectedOperand] = {}
  must2[i]["range"][selectedOperand]['lte'] = value
  must2[i]["range"][selectedOperand]['gt'] =  0
}
else if(type == "query-builder-group" && selectedOperator == 'gte & lt' && query.logicalOperator == "All"){
  must2.push({"range":{}})
  must2[i]["range"] = {}
  must2[i]["range"][selectedOperand] = {}
  must2[i]["range"][selectedOperand]['lt'] =  value
  must2[i]["range"][selectedOperand]['gte'] =  0
}
else if(type == "query-builder-group" && (selectedOperator == 'gt' || selectedOperator == 'lt' || selectedOperator == 'gte' || selectedOperator == 'lte') && query.logicalOperator == "Any"){
  should2.push({"range":{}})
  should2[i]["range"] = {}
  should2[i]["range"][selectedOperand] = {}
  should2[i]["range"][selectedOperand][selectedOperator] =  value
}
else if(type == "query-builder-group" && selectedOperator == 'gt & lt' && query.logicalOperator == "Any"){
  should2.push({"range":{}})
  should2[i]["range"] = {}
  should2[i]["range"][selectedOperand] = {}
  should2[i]["range"][selectedOperand]['lt'] =  value
  should2[i]["range"][selectedOperand]['gt'] =  0
}
else if(type == "query-builder-group" && selectedOperator == 'gte & lte' && query.logicalOperator == "Any"){
  should2.push({"range":{}})
  should2[i]["range"] = {}
  should2[i]["range"][selectedOperand] = {}
  should2[i]["range"][selectedOperand]['lte'] =  value
  should2[i]["range"][selectedOperand]['gte'] =  0
}
else if(type == "query-builder-group" && selectedOperator == 'gt & lte' && query.logicalOperator == "Any"){
  should2.push({"range":{}})
  should2[i]["range"] = {}
  should2[i]["range"][selectedOperand] = {}
  should2[i]["range"][selectedOperand]['lte'] =  value
  should2[i]["range"][selectedOperand]['gt'] =  0
}
else if(type == "query-builder-group" && selectedOperator == 'gte & lt' && query.logicalOperator == "Any"){
  should2.push({"range":{}})
  should2[i]["range"] = {}
  should2[i]["range"][selectedOperand] = {}
  should2[i]["range"][selectedOperand]['lt'] =  value
  should2[i]["range"][selectedOperand]['gte'] =  0
}
}
return 1
},
  convertToElastic(query){
    var main_query = {}
    must = []
    should = []
    must2 = []
    should2 = []
    for(var i=0;i<query.children.length;i++){
      if(query.children[i].type == "query-builder-rule"){
        var sub_query = this.createQuery(query,query.children[i],query.children[i].type,i)
      }
      else if(query.children[i].type == "query-builder-group"){
        console.log("...........Query Builder Group................")
        console.log("^^^^^^^^^^^^^^",query.children[i])
        must2 = []
        should2 = []
        for(var j=0 ; j < query.children[i].query.children.length ; j++){
          var sub_query = this.createQuery(query.children[i].query,query.children[i].query.children[j],query.children[i].type,j)
        }
        if(query.children[i].query.logicalOperator == "All"){
          if(query.logicalOperator == "All"){
           must.push({"bool":{"must":must2}})
         }
         else{
           should.push({"bool":{"must":must2}})
         }
       }
       else {
         if(query.logicalOperator == "All"){
          must.push({"bool":{"should":should2}})
        }
         should.push({"bool":{"should":should2}})

       }
      }
    }
    if(query.logicalOperator == "All"){
    main_query = {"query": { "bool":{ "must":must}}}
    }
    else{
    main_query = {"query": { "bool":{ "should":should}}}
    }
    return main_query
  }
  },

  data () {
      return {
        basicDemoInitialQuery: {
          "logicalOperator": "All",
          "children": [
            {
              "type": "query-builder-rule",
              "query": {
                "rule": "first-name",
                "selectedOperator": "equals",
                "selectedOperand": "First Name",
                "value": "ABC"
              }
            },
            {
              "type": "query-builder-group",
              "query": {
                "logicalOperator": "All",
                "children": [
                  {
                    "type": "query-builder-rule",
                    "query": {
                      "rule": "first-name",
                      "selectedOperator": "equals",
                      "selectedOperand": "First Name",
                      "value": "John"
                    }
                  },
                  {
                    "type": "query-builder-rule",
                    "query": {
                      "rule": "first-name",
                      "selectedOperator": "equals",
                      "selectedOperand": "First Name",
                      "value": "Sally"
                    }
                  }
                ]
              }
            }
          ]
        },
        basicDemoQuery: null,
        basicDemoRules: [
          {
            type: "text",
            id: "first-name",
            label: "First Name",
            operators: ['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']
          },
          {
            type: "text",
            id: "last-name",
            label: "Last Name",
            operators: ['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']
          },
          {
            type: "custom-component",
            component: RangeInput,
            id: 'price',
            label: 'Price',
            operators: ['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],
            default: 1
          }
        ],
        basicLabels : {
            matchType: "Match Type",
            matchTypeAll: "All",
            matchTypeAny: "Any",
            addRule: "Add Rule",
            removeRule: "&times;",
            addGroup: "Add Group",
            removeGroup: "&times;",
            textInputPlaceholder: "value",
        }
      }
  }
}
</script>
<style>
</style>
