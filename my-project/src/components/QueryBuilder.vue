<template>
  <div id="app">
    <div>
      <div class="col-md-2" style="margin-top:3%">
      <span><b>EsUrl: </b></span>
      <input v-model="esUrl" placeholder="Please input esUrl" style="margin-left:1%">
     </div>
     <div class="col-md-2" style="margin-top:3%">
      <span><b>Index: </b></span>
      <input v-model="index" placeholder="Please input index" style="margin-left:1%">
    </div>
     <div class="col-md-4" style="margin-top:3%">
      <span><b>Type:</b></span>
      <input v-model="type" placeholder="Please input type" style="margin-left:1%">
      <button @click="Generate()" style="margin-left:5%">Generate fields</button>
    </div>
  </div>
    <div>
      <div class="col-md-6">
        <h2>Basic Demo</h2>
        <div>
                <vue-query-builder :rules="basicDemoRules"
                :maxDepth="2"
                @queryUpdated="basicDemoQueryUpdated"
                :labels="basicLabels"
                ></vue-query-builder>
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
import axios from 'axios'
var must = []
var should = []
var must2 = []
var should2 = []
var data2 = []
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
  getNestedmapping(key,type,mappings_obj){
    let parent_key = key
    var self = this
    console.log("inside getNestedmapping",type,mappings_obj)
    for(var key in mappings_obj ) {
      console.log("inside for loop")
      let type1 = mappings_obj[key].type
      console.log("type1...",type1)
       if(type1 == "string" || type1 == "text" || type1 == "keyword"){
         data2.push({"type":"text","id":parent_key + " => " + key,"label":parent_key + " => " + key,"operators":['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']})
       }
       else if(type1 == "integer" || type1 == "double" ||  type1 == "long" || type1 == "float" || type1 == "short" || type1 == "byte" || type1 == "half_float" || type1 == "scaled float"){
         data2.push({"type":"numeric","id":parent_key + " => " + key,"label":parent_key + " => " + key,"operators":['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']},
                    {"type":"custom-component","component":RangeInput,"id":parent_key + " => " + key + "-Range","label":parent_key + " => " + key + "-Range","operators":['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],"default":1})
       }
       else if(type1 == "integer_range" || type1 == "double_range" || type1 == "long_range" || type1 == "float_range"){
         data2.push({"type":"custom-component","component":RangeInput,"id":parent_key + " => " + key,"label":parent_key + " => " + key,"operators":['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],"default":1})
       }
       else if(type1 == "nested"){
         var nested = self.getNestedmapping(parent_key + " => " + key,type1,mappings_obj[key].properties)
       }
   }
   return 1
  },
  Generate(){
    console.log("called....",this.esUrl,this.index,this.type)
    var url = this.esUrl;
    var index = this.index;
    var type = this.type;
    var self = this
    axios.get('http://localhost:3030/querybuilder-api', {
    params: {
      url: url,
      index:index,
      type: type
    }
  })
     .then(function (response) {
       console.log("Response....................",response);
       let mappings_obj = response.data[index]["mappings"][type]
       console.log("++++++++++++",mappings_obj)
       data2.length = 0
       for(var key in mappings_obj.properties ) {
         let type = mappings_obj.properties[key].type
          if(type == "string" || type == "text" || type == "keyword"){
            data2.push({"type":"text","id":key,"label":key,"operators":['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']})
          }
          else if(type == "integer" || type == "double" ||  type == "long" || type == "float" || type == "short" || type == "byte" || type == "half_float" || type == "scaled float"){
            data2.push({"type":"numeric","id":key,"label":key,"operators":['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']},
                       {"type":"custom-component","component":RangeInput,"id":key + "-Range","label":key + "-Range","operators":['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],"default":1})
          }
          else if(type == "integer_range" || type == "double_range" || type == "long_range" || type == "float_range"){
            data2.push({"type":"custom-component","component":RangeInput,"id":key,"label":key,"operators":['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],"default":1})
          }
          else if(type == "nested"){
            var nested = self.getNestedmapping(key,type,mappings_obj.properties[key].properties)
            console.log("nested.............",nested)
          }
      }
      console.log("dataaaa.............",data2)
     })
     .catch(function (error) {
       console.log("Error....................",error);
     });

  },
  depthCheck(must,i){
    console.log("depthCheck called",must,i)
    for(var key in must){
      console.log("for loop called",key)
         if(key == "query"){
           console.log("query......called",must.query,must["query"])
           if(Object.keys(must["query"]).length != 0 ){
             console.log("inner loop called.......")
             var s = this.depthCheck(must["query"]["nested"],i)
             console.log("********* s",s)
          }
         }
    }
    return must["query"]
  },
  Query(pushObject,selectedOperand,value,query,children,type){
    if(children.query.selectedOperator == "equals"){
        pushObject["term"] = {}
        pushObject["term"][selectedOperand] = value
    }
    else if(children.query.selectedOperator == "contains"){
        pushObject["match"] = {}
        pushObject["match"][selectedOperand] = value
    }
    else if(children.query.selectedOperator == "does not contain"){
      pushObject["bool"] = {}
      pushObject["bool"]["must_not"] = [{"match":{}}]
      pushObject["bool"]["must_not"][0]["match"][selectedOperand] = value
    }
    else if(children.query.selectedOperator == "is empty"){
      pushObject["bool"] = {}
      pushObject["bool"]["must_not"] = [{"exists":{}}]
      pushObject["bool"]["must_not"][0]["exists"]["field"] =  selectedOperand
  }
    else if(children.query.selectedOperator == "is not empty"){
      pushObject["exists"] = {}
      pushObject["match"]["field"] = selectedOperand
    }
    else if(children.query.selectedOperator == "begins with"){
      pushObject["prefix"] = {}
      pushObject["prefix"][selectedOperand] = value
  }
    else if(children.query.selectedOperator == "ends with"){
      pushObject["wildcard"] = {}
      pushObject["wildcard"][selectedOperand] = "*" + value
    }
    else if(children.query.selectedOperator == "exact match"){
        pushObject["match_phrase"] = {}
        pushObject["match_phrase"][selectedOperand] =  value
  }
  else if(children.query.selectedOperator == "match phrase prefix"){
      pushObject["match_phrase_prefix"] = {}
      pushObject["match_phrase_prefix"][selectedOperand] =  value
  }
  else {
    var selectedOperator = children.query.selectedOperator
    var replace = "-Range"
    var selectedOperand = selectedOperand.replace(replace,"")
    if(selectedOperator == 'gt' || selectedOperator == 'lt' ||selectedOperator == 'gte' || selectedOperator == 'lte'){
      pushObject["range"] = {}
      pushObject["range"][selectedOperand] = {}
      pushObject["range"][selectedOperand][selectedOperator] =  value
   }
   else if(selectedOperator == 'gt & lt'){
       pushObject["range"] = {}
       pushObject["range"][selectedOperand] = {}
       pushObject["range"][selectedOperand]['lt'] =  value
       pushObject["range"][selectedOperand]['gt'] =  0
    }
  else if(selectedOperator == 'gte & lte'){
      pushObject["range"] = {}
      pushObject["range"][selectedOperand] = {}
      pushObject["range"][selectedOperand]['lte'] =  value
      pushObject["range"][selectedOperand]['gte'] =  0
 }
 else if(selectedOperator == 'gt & lte'){
     pushObject["range"] = {}
     pushObject["range"][selectedOperand] = {}
     pushObject["range"][selectedOperand]['lte'] = value
     pushObject["range"][selectedOperand]['gt'] =  0
}
  else if(selectedOperator == 'gte & lt'){
    pushObject["range"] = {}
    pushObject["range"][selectedOperand] = {}
    pushObject["range"][selectedOperand]['lt'] =  value
    pushObject["range"][selectedOperand]['gte'] =  0
  }
  }
},
  pushObject(must,selectedOperand,i){
    console.log("LLLLLLLLLLLLLLL",must)
    if(must["nested"] != undefined){
      console.log("else called")
       var depthCheck = this.depthCheck(must["nested"],i)
       console.log("depth...",depthCheck)
       return depthCheck
    }

  },
  createQuery(query,children,type,i){
    var selectedOperand = children.query.selectedOperand
    var value = children.query.value
    var pushObject
    var flag
    console.log("Ektaaa....................",selectedOperand,selectedOperand.indexOf("=>"))
    if(selectedOperand.indexOf("=>") != -1){
      console.log("called.............................")
      var count = selectedOperand.split(" => ")
      console.log("==========",count)
      if(type == "query-builder-rule" && query.logicalOperator == "All"){
        if(must["nested"] == undefined){
          console.log("+++++++++++++++++ query builder rule all")
          must.push({"nested":{"path":selectedOperand.split(' => ')[0]}})
          console.log("must....",must)
          must[i]["nested"]["query"] = {}
          pushObject = must[i]["nested"]["query"]
          flag = false

          for(var k=0 ;k < count.length - 2 ; k++){
             console.log("k...",k)
             pushObject = this.pushObject(must[i],selectedOperand,i,k)
             console.log("push....",pushObject,selectedOperand.split(' => ')[k+1])
             pushObject["nested"] = {}
             pushObject["nested"]["path"] = selectedOperand.split(' => ')[k+1]
             pushObject["nested"]["query"] = {}
             console.log("push ++++++++++++",pushObject)
              flag = true
          }

            if(flag == true){
             pushObject = pushObject["nested"]["query"]
             selectedOperand = count[count.length-2] + "." + count[count.length-1]
             var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
           }
           else if(flag == false){
            var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
           }




         }
    }
    else if(type == "query-builder-rule" && query.logicalOperator == "Any"){
      if(should["nested"] == undefined){
        console.log("+++++++++++++++++ query builder rule any")
        should.push({"nested":{"path":selectedOperand.split(' => ')[0]}})
        should[i]["nested"]["query"] = {}
        pushObject = should[i]["nested"]["query"]
        flag = false

        for(var k=0 ;k < count.length - 2 ; k++){
           console.log("k...",k)
           pushObject = this.pushObject(should[i],selectedOperand,i,k)
           console.log("push....",pushObject)
           pushObject["nested"] = {}
           pushObject["nested"]["path"] = selectedOperand.split(' => ')[k+1]
           pushObject["nested"]["query"] = {}
           flag = true
        }
         if(flag == true){
           pushObject = pushObject["nested"]["query"]
           selectedOperand = count[count.length-2] + "." + count[count.length-1]
           var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
         }
         else if(flag == false){
           var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
         }

       }
    }
    else if(type == "query-builder-group" && query.logicalOperator == "All"){
      if(must2["nested"] == undefined){
        console.log("+++++++++++++++++ query builder group all")
        must2.push({"nested":{"path":selectedOperand.split(' => ')[0]}})
        must2[i]["nested"]["query"] = {}
        pushObject = must2[i]["nested"]["query"]
        flag = false

        for(var k=0 ;k < count.length - 2 ; k++){
           console.log("k...",k)
           pushObject = this.pushObject(must2[i],selectedOperand,i,k)
           console.log("push....",pushObject)
           pushObject["nested"] = {}
           pushObject["nested"]["path"] = selectedOperand.split(' => ')[k+1]
           pushObject["nested"]["query"] = {}
          flag = true
        }

        if(flag == true){
          pushObject = pushObject["nested"]["query"]
          selectedOperand = count[count.length-2] + "." + count[count.length-1]
          var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
        }
        else if(flag == false){
           var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
        }

       }
    }
    else if(type == "query-builder-group" && query.logicalOperator == "Any"){
      if(should2["nested"] == undefined){
        console.log("+++++++++++++++++ query builder group any")
      should2.push({"nested":{"path":selectedOperand.split(' => ')[0]}})
        should2[i]["nested"]["query"] = {}
        pushObject = should2[i]["nested"]["query"]
        flag = false

        for(var k=0 ;k < count.length - 2 ; k++){
           console.log("k...",k)
           pushObject = this.pushObject(should2[i],selectedOperand,i,k)
           console.log("push....",pushObject,selectedOperand.split(' => ')[k+1])
           pushObject["nested"] = {}
           pushObject["nested"]["path"] = selectedOperand.split(' => ')[k+1]
           pushObject["nested"]["query"] = {}
           flag = true
        }

         if(flag == true){
           pushObject = pushObject["nested"]["query"]
           selectedOperand = count[count.length-2] + "." + count[count.length-1]
           var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
         }
         else if(flag == false){
           var query3 = this.Query(pushObject,selectedOperand.replace(" => ","."),value,query,children,type)
        }

       }
    }

  }
    else {
      console.log("called.........2.....................")
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
  else {
    var selectedOperator = children.query.selectedOperator
    var replace = "-Range"
    var selectedOperand = selectedOperand.replace(replace,"")
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
        basicDemoQuery: null,
        basicDemoRules: data2,
        // basicDemoRules: [
        //   {
        //     type: "numeric",
        //     id: "first-name",
        //     label: "First Name",
        //     operators: ['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']
        //   },
        //   {
        //     type: "text",
        //     id: "last-name",
        //     label: "Last Name",
        //     operators: ['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']
        //   },
        //   {
        //     type: "custom-component",
        //     component: RangeInput,
        //     id: 'price',
        //     label: 'Price',
        //     operators: ['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],
        //     default: 1
        //   }
        //   {
        //   type: "select",
        //   id: 'age',
        //   label: 'Age',
        //   choices: [{"label": "min","value":"min"},{"label":"max","value":"max"},{"label":"sum","value":"sum"}],
        //   operands: [
        //     'Aggregation'
        //   ]
        // }
        // ],
        basicLabels : {
            matchType: "Match Type",
            matchTypeAll: "All",
            matchTypeAny: "Any",
            addRule: "Add Rule",
            removeRule: "&times;",
            addGroup: "Add Group",
            removeGroup: "&times;",
            textInputPlaceholder: "value",
        },
        esUrl: 'http://localhost:9200',
        index: 'product',
        type: 'product'
      }
  },
  mounted(){
    let self = this


  }
}
</script>
<style>
</style>
