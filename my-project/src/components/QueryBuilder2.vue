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
     <div class="col-md-2" style="margin-top:3%">
      <span><b>Type: </b></span>
      <input v-model="type" placeholder="Please input type" style="margin-left:1%">
    </div>
    <div class="col-md-2" style="margin-top:3%">
     <span><b>User: </b></span>
     <input v-model="username" placeholder="Please input username" style="margin-left:1%">
   </div>
   <div class="col-md-2" style="margin-top:3%">
    <span><b>Password: </b></span>
    <input type="password" v-model="password" placeholder="Please input password" style="margin-left:1%">
  </div>
  <div class="col-md-2" style="margin-top:3%">
    <button @click="Generate()" style="margin-left:1%">Generate fields</button>
 </div>
  </div>
    <div>
      <div class="col-md-6">
        <h2>Basic Demo</h2>
        <div>
                <vue-query-builder :rules="basicDemoRules"
                :maxDepth="3"
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
// import iView from 'iview'
import axios from 'axios'
import bodybuilder from 'bodybuilder'
// Vue.use(iView);
var data2 = []
export default {
  name: 'app',
  components: {
    VueQueryBuilder
  },
  methods: {
    basicDemoQueryUpdated (query) {
      // console.log("query...",query)
      let elastic_query = this.convertToElastic(query)
      this.basicDemoQuery = query;

    Vue.nextTick(function () {
      let basicDemoOutput = document.getElementById('basic-demo-output');
      basicDemoOutput.innerHTML = JSON.stringify(elastic_query, null, 2);
      document.dispatchEvent( new Event('rerender-prism') );
    });
  },
  getNestedmapping(key,type,mappings_obj){
    let parent_key = key
    let self = this
    for(var key in mappings_obj ) {
      let type1 = mappings_obj[key].type
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
         let nested = self.getNestedmapping(parent_key + " => " + key,type1,mappings_obj[key].properties)
       }
   }
   return 1
  },
  getMapping(key,type,mappings_obj){
    let parent_key = key
    let self = this
    for(var key in mappings_obj ) {
      let type1 = mappings_obj[key].type
       if(type1 == "string" || type1 == "text" || type1 == "keyword"){
         data2.push({"type":"text","id":parent_key + "." + key,"label":parent_key + "." + key,"operators":['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']})
       }
       else if(type1 == "integer" || type1 == "double" ||  type1 == "long" || type1 == "float" || type1 == "short" || type1 == "byte" || type1 == "half_float" || type1 == "scaled float"){
         data2.push({"type":"numeric","id":parent_key + "." + key,"label":parent_key + "." + key,"operators":['equals','contains','does not contain','is empty','is not empty','begins with','ends with','exact match','match phrase prefix']},
                    {"type":"custom-component","component":RangeInput,"id":parent_key + "." + key + "-Range","label":parent_key + "." + key + "-Range","operators":['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],"default":1})
       }
       else if(type1 == "integer_range" || type1 == "double_range" || type1 == "long_range" || type1 == "float_range"){
         data2.push({"type":"custom-component","component":RangeInput,"id":parent_key + "." + key,"label":parent_key + "." + key,"operators":['gt','lt','gte','lte','gt & lt','gte & lte','gt & lte','gte & lt'],"default":1})
       }
       else if(type1 == "nested"){
         let nested = self.getNestedmapping(parent_key + "." + key,type1,mappings_obj[key].properties)
       }
       else {
         let mapping = self.getMapping(parent_key + "." + key,type1,mappings_obj[key].properties)
       }
   }
   return 1
  },
  Generate(){
    let url = this.esUrl;
    let index = this.index;
    let type = this.type;
    let username = this.username;
    let password = this.password;
    let self = this
    axios.get('http://localhost:3031/querybuilder-api', {
    params: {
      url: url,
      index:index,
      type: type,
      username: username,
      password: password
    }
  })
     .then(function (response) {
       let mappings_obj = response.data[index]["mappings"][type]
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
            let nested = self.getNestedmapping(key,type,mappings_obj.properties[key].properties)
          }
          else {
            let mapping = self.getMapping(key,type,mappings_obj.properties[key].properties)
          }
      }
     })
     .catch(function (error) {
       console.log("Error....................",error);
     });

  },
  convertToElastic(query){
    let body = bodybuilder()
    for(var i=0;i<query.children.length;i++){
      if(query.children[i].type == "query-builder-rule"){
        body = this.recursion(body,query.children[i],query.logicalOperator,query.children[i].type,query.children[i].query.selectedOperand,query.children[i].query.selectedOperator,query.children[i].query.value)
      }
      else if(query.children[i].type == "query-builder-group"){
        // console.log("---------query-builder-group----------",query.children[i])
        if(query.logicalOperator == "All"){
          let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
          body = body.query("bool",b => body_group)
       }
       else if(query.logicalOperator == "Any"){
         let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
         body = body.orQuery("bool",b => body_group)
       }
      }
    }
    var elastic_query = body.build()
    // console.log("+++++++++++++",elastic_query)
    return elastic_query

  },
  queryBuilderGroup(query,logicalOperator){
    let body1 = bodybuilder()
    for(var i=0;i<query.children.length;i++){
      if(query.children[i].type == "query-builder-rule"){
        body1 = this.filter(body1,query.children[i],query.logicalOperator,query.children[i].type,query.children[i].query.selectedOperand,query.children[i].query.selectedOperator,query.children[i].query.value)
      }
      else if(query.children[i].type == "query-builder-group"){
        // console.log("---------query-builder-group----------",query.children[i])
        if(logicalOperator == "All"){
          let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
          body1 = body1.filter("bool",b => body_group)
          // console.log("body_group....................",body1)
        }
        else if(logicalOperator == "Any"){
          let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
          body1 = body1.orFilter("bool",b => body_group)
          // console.log("body_group....................",body1)
        }

      }
    }
    return body1
  },
  recursion(body,query,logicalOperator,type,selectedOperand,selectedOperator,value){
    // console.log(selectedOperand)
    if(logicalOperator == "All"){
      if(selectedOperand.indexOf("=>") != -1){
          let nested_array = selectedOperand.split(" => ")
          console.log("nested_array......",nested_array)
          let selectedOperand1 = nested_array[0] + "." + nested_array[nested_array.length-1]
          let nestedQuery1 = this.recursion(bodybuilder(),query,"All",type,selectedOperand1,selectedOperator,value)
          let path = nested_array[0]
          if(nested_array.length > 2){
          for(var i=1 ; i < nested_array.length - 1 ; i++){
            path = path +  "." + nested_array[i]
         }
       }
          body = body.query("nested","path",path, q => nestedQuery1)
      }
      else if(selectedOperator == "equals"){
        body = body.query("term",selectedOperand,value)
      }
      else if(selectedOperator == "contains"){
        body = body.query("match",selectedOperand,value)
      }
      else if(selectedOperator == "does not contain"){
        body = body.notQuery('match',selectedOperand,value)
      }
      else if(selectedOperator == "is empty"){
        body = body.notQuery('exists',"field",selectedOperand)
      }
      else if(selectedOperator == "is not empty"){
        body = body.query("exists","field",selectedOperand)
      }
      else if(selectedOperator == "begins with"){
        body = body.query("prefix",selectedOperand,value)
      }
      else if(selectedOperator == "ends with"){
        body = body.query("wildcard",selectedOperand,"*" + value)
      }
      else if(selectedOperator == "match phrase prefix"){
        body = body.query("match_phrase_prefix",selectedOperand,value)
      }
      else if(selectedOperator == "exact match"){
        body = body.query("match_phrase",selectedOperand,value)
      }
      else {
        if(selectedOperator == 'gt' || selectedOperator == 'lt' || selectedOperator == 'gte' || selectedOperator == 'lte'){
          var obj = {}
          var selectedOperand = selectedOperand.replace("-Range","")
          obj[selectedOperator] = value
          body = body.query("range",selectedOperand,obj)
        }
        else {
          var obj = {}
          var selectedOperand = selectedOperand.replace("-Range","")
          var selectedOperator = selectedOperator.split(' & ')
          obj[selectedOperator[0]] = 0
          obj[selectedOperator[1]] = value
          body = body.query("range",selectedOperand,obj)
        }
      }
    }
    else {
      if(selectedOperand.indexOf("=>") != -1){
        let nested_array = selectedOperand.split(" => ")
        console.log("nested_array......",nested_array)
        let selectedOperand1 = nested_array[0] + "." + nested_array[nested_array.length-1]
        let nestedQuery1 = this.recursion(bodybuilder(),query,"All",type,selectedOperand1,selectedOperator,value)
        let path = nested_array[0]
        if(nested_array.length > 2){
        for(var i=1 ; i < nested_array.length - 1 ; i++){
          path = path +  "." + nested_array[i]
       }
     }
        body = body.orQuery("nested","path",path, q => nestedQuery1)
      }
      else if(selectedOperator == "equals"){
        body = body.orQuery("term",selectedOperand,value)
      }
      else if(selectedOperator == "contains"){
        body = body.orQuery("match",selectedOperand,value)
      }
      else if(selectedOperator == "does not contain"){
        body = body.notQuery("match",selectedOperand,value)
      }
      else if(selectedOperator == "is empty"){
        body = body.notQuery("exists","field",selectedOperand)
      }
      else if(selectedOperator == "is not empty"){
        body = body.orQuery("exists","field",selectedOperand)
      }
      else if(selectedOperator == "begins with"){
        body = body.orQuery("prefix",selectedOperand,value)
      }
      else if(selectedOperator == "ends with"){
        body = body.orQuery("wildcard",selectedOperand,"*" + value)
      }
      else if(selectedOperator == "match phrase prefix"){
        body = body.orQuery("match_phrase_prefix",selectedOperand,value)
      }
      else if(selectedOperator == "exact match"){
        body = body.orQuery("match_phrase",selectedOperand,value)
      }
      else {
        if(selectedOperator == 'gt' || selectedOperator == 'lt' || selectedOperator == 'gte' || selectedOperator == 'lte'){
          let obj = {}
          let selectedOperand = selectedOperand.replace("-Range","")
          obj[selectedOperator] = value
          body = body.orQuery("range",selectedOperand,obj)
        }
        else {
          let obj = {}
          let selectedOperand = selectedOperand.replace("-Range","")
          let selectedOperator = selectedOperator.split(' & ')
          obj[selectedOperator[0]] = 0
          obj[selectedOperator[1]] = value
          body = body.orQuery("range",selectedOperand,obj)
        }
      }
    }
    return body
  },
  filter(body,query,logicalOperator,type,selectedOperand,selectedOperator,value){
    if(logicalOperator == "All"){
      if(selectedOperand.indexOf("=>") != -1){
        // console.log("index......",selectedOperand.indexOf("=>"))
        let nested_array = selectedOperand.split(" => ")
        // console.log("nested_array......",nested_array)
        let selectedOperand1 = nested_array[0] + "." + nested_array[nested_array.length-1]
        let nestedQuery1 = this.filter(bodybuilder(),query,"All",type,selectedOperand1,selectedOperator,value)
        let path = nested_array[0]
        if(nested_array.length > 2){
        for(var i=1 ; i < nested_array.length - 1 ; i++){
          path = path +  "." + nested_array[i]
       }
     }
        body = body.filter("nested","path",path, q => nestedQuery1)
      }
      else if(selectedOperator == "equals"){
        body = body.filter("term",selectedOperand,value)
      }
      else if(selectedOperator == "contains"){
        body = body.filter("match",selectedOperand,value)
      }
      else if(selectedOperator == "does not contain"){
        body = body.notFilter('match',selectedOperand,value)
      }
      else if(selectedOperator == "is empty"){
        body = body.notFilter('exists',"field",selectedOperand)
      }
      else if(selectedOperator == "is not empty"){
        body = body.filter("exists","field",selectedOperand)
      }
      else if(selectedOperator == "begins with"){
        body = body.filter("prefix",selectedOperand,value)
      }
      else if(selectedOperator == "ends with"){
        body = body.filter("wildcard",selectedOperand,"*" + value)
      }
      else if(selectedOperator == "match phrase prefix"){
        body = body.filter("match_phrase_prefix",selectedOperand,value)
      }
      else if(selectedOperator == "exact match"){
        body = body.filter("match_phrase",selectedOperand,value)
      }
      else {
        if(selectedOperator == 'gt' || selectedOperator == 'lt' || selectedOperator == 'gte' || selectedOperator == 'lte'){
          let obj = {}
          let selectedOperand = selectedOperand.replace("-Range","")
          obj[selectedOperator] = value
          body = body.filter("range",selectedOperand,obj)
        }
        else {
          let obj = {}
          let selectedOperand = selectedOperand.replace("-Range","")
          let selectedOperator = selectedOperator.split(' & ')
          obj[selectedOperator[0]] = 0
          obj[selectedOperator[1]] = value
          body = body.filter("range",selectedOperand,obj)
        }
      }
    }
    else {
      if(selectedOperand.indexOf("=>") != -1){
        // console.log("index......",selectedOperand.indexOf("=>"))
        //  console.log("index......",selectedOperand.indexOf("=>"))
         let nested_array = selectedOperand.split(" => ")
        //  console.log("nested_array......",nested_array)
         let selectedOperand1 = nested_array[0] + "." + nested_array[nested_array.length-1]
         let nestedQuery1 = this.filter(bodybuilder(),query,"All",type,selectedOperand1,selectedOperator,value)
         let path = nested_array[0]
         if(nested_array.length > 2){
         for(var i=1 ; i < nested_array.length - 1 ; i++){
           path = path +  "." + nested_array[i]
        }
      }
         body = body.orFilter("nested","path",path, q => nestedQuery1)
      }
      else if(selectedOperator == "equals"){
        body = body.orFilter("term",selectedOperand,value)
      }
      else if(selectedOperator == "contains"){
        body = body.orFilter("match",selectedOperand,value)
      }
      else if(selectedOperator == "does not contain"){
        body = body.notFilter("match",selectedOperand,value)
      }
      else if(selectedOperator == "is empty"){
        body = body.notFilter("exists","field",selectedOperand)
      }
      else if(selectedOperator == "is not empty"){
        body = body.orFilter("exists","field",selectedOperand)
      }
      else if(selectedOperator == "begins with"){
        body = body.orFilter("prefix",selectedOperand,value)
      }
      else if(selectedOperator == "ends with"){
        body = body.orFilter("wildcard",selectedOperand,"*" + value)
      }
      else if(selectedOperator == "match phrase prefix"){
        body = body.orFilter("match_phrase_prefix",selectedOperand,value)
      }
      else if(selectedOperator == "exact match"){
        body = body.orFilter("match_phrase",selectedOperand,value)
      }
      else {
        if(selectedOperator == 'gt' || selectedOperator == 'lt' || selectedOperator == 'gte' || selectedOperator == 'lte'){
          let obj = {}
          let selectedOperand = selectedOperand.replace("-Range","")
          obj[selectedOperator] = value
          body = body.orFilter("range",selectedOperand,obj)
        }
        else {
          let obj = {}
          let selectedOperand = selectedOperand.replace("-Range","")
          let selectedOperator = selectedOperator.split(' & ')
          obj[selectedOperator[0]] = 0
          obj[selectedOperator[1]] = value
          body = body.orFilter("range",selectedOperand,obj)
        }
      }
    }
    return body
  }
},
  data () {
      return {
        basicDemoQuery: null,
        basicDemoRules: data2,
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
        esUrl: '',
        index: '',
        type: '',
        username: '',
        password: ''
      }
  }
}
</script>
<style>
</style>
