import Vue from 'vue'
import Router from 'vue-router'
import QueryBuilder from '@/components/QueryBuilder'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'QueryBuilder',
      component: QueryBuilder
    }
  ]
})
