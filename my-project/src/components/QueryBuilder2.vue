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
import bodybuilder from 'bodybuilder'
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
      this.basicDemoQuery = query;

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
    var self = this
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
    var body = bodybuilder()
    for(var i=0;i<query.children.length;i++){
      if(query.children[i].type == "query-builder-rule"){
        body = this.recursion(body,query.children[i],query.logicalOperator,query.children[i].type,query.children[i].query.selectedOperand,query.children[i].query.selectedOperator,query.children[i].query.value)
      }
      else if(query.children[i].type == "query-builder-group"){
        console.log("---------query-builder-group----------",query.children[i])
        if(query.logicalOperator == "All"){
          let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
          body = body.query("bool",b => body_group)
          console.log("body_group....................",body)
       }
       else if(query.logicalOperator == "Any"){
         let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
         body = body.orQuery("bool",b => body_group)
         console.log("body_group....................",body)
       }
      }
    }
    var elastic_query = body.build()
    console.log("+++++++++++++",elastic_query)
    return elastic_query

  },
  queryBuilderGroup(query,logicalOperator){
    var body1 = bodybuilder()
    for(var i=0;i<query.children.length;i++){
      if(query.children[i].type == "query-builder-rule"){
        body1 = this.recursion(body1,query.children[i],query.logicalOperator,query.children[i].type,query.children[i].query.selectedOperand,query.children[i].query.selectedOperator,query.children[i].query.value)
      }
      else if(query.children[i].type == "query-builder-group"){
        console.log("---------query-builder-group----------",query.children[i])
        if(logicalOperator == "All"){
          let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
          body1 = body1.query("bool",b => body_group)
          console.log("body_group....................",body1)
        }
        else if(logicalOperator == "Any"){
          let body_group = this.queryBuilderGroup(query.children[i].query,query.children[i].query.logicalOperator)
          body1 = body1.orQuery("bool",b => body_group)
          console.log("body_group....................",body1)
        }

      }
    }
    return body1
  },
  recursion(body,query,logicalOperator,type,selectedOperand,selectedOperator,value){
    console.log(selectedOperand)
    if(logicalOperator == "All"){
      if(selectedOperand.indexOf("=>") != -1){
          let nested_array = selectedOperand.split(" => ")
          console.log("nested_array......",nested_array)
          let selectedOperand1 = nested_array[nested_array.length-2] + "." + nested_array[nested_array.length-1]
          let nestedQuery1 = this.recursion(bodybuilder(),query,logicalOperator,type,selectedOperand1,selectedOperator,value)
          for(var i = nested_array.length ; i > nested_array.length-(nested_array.length-2) ; i--){
            nestedQuery1 = bodybuilder().query('nested','path',nested_array[i-2],q => nestedQuery1)
          }
          body = body.query("nested","path",nested_array[0], q => nestedQuery1)
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
          let selectedOperand1 = nested_array[nested_array.length-2] + "." + nested_array[nested_array.length-1]
          let nestedQuery1 = this.recursion(bodybuilder(),query,logicalOperator,type,selectedOperand1,selectedOperator,value)
          for(var i = nested_array.length ; i > nested_array.length-(nested_array.length-2) ; i--){
            nestedQuery1 = bodybuilder().query('nested','path',nested_array[i-2],q => nestedQuery1)
          }
          body = body.query("nested","path",nested_array[0], q => nestedQuery1)
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
          var obj = {}
          var selectedOperand = selectedOperand.replace("-Range","")
          obj[selectedOperator] = value
          body = body.orQuery("range",selectedOperand,obj)
        }
        else {
          var obj = {}
          var selectedOperand = selectedOperand.replace("-Range","")
          var selectedOperator = selectedOperator.split(' & ')
          obj[selectedOperator[0]] = 0
          obj[selectedOperator[1]] = value
          body = body.orQuery("range",selectedOperand,obj)
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
        type: ''
      }
  }
}
</script>
<style>
</style>
