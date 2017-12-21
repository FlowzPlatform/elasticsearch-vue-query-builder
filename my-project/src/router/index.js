import Vue from 'vue'
import Router from 'vue-router'
import QueryBuilder2 from '@/components/QueryBuilder2'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'QueryBuilder2',
      component: QueryBuilder2
    }
  ]
})
