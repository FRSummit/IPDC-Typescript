<template>
    <div class="create-plan-vue">
        <Member/> 
        <Navbar2/> 
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import  Member  from './Member';
import  Navbar2  from '../../../CommonLayout/NavBar2.vue';
import { UnitPlanReportService } from "../../../../services/UnitPlanReportService"
const unitPlanReportService = new UnitPlanReportService();

export default {
  components: {
      Member,
      Navbar2
  },
  created() {
  }
};
</script>