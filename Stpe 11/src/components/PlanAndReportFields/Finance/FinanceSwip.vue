<template>
    <div class="report-landing-vue">
        <v-ons-page class="Page-MT">
            <v-card color="basil">
                <v-tabs v-model="tab" background-color="transparent" grow>
                <v-tab class="my_tab"  v-for="item in items" :key="item">{{ item }}</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab">
                <v-tab-item v-for="item in items" :key="item">
                    <v-card color="basil" flat>
                    <v-card v-if="item === 'BaitulMal'"><BaitulMal/></v-card>
                    <v-card v-if="item === 'MasjidProject'"><MasjidProject/></v-card>
                    <v-card v-if="item === 'MasjidTableBank'"><MasjidTableBank/></v-card>
                    </v-card>
                </v-tab-item>
                </v-tabs-items>
            </v-card>
        </v-ons-page>
    </div>
</template>

<script>
import BaitulMal from './BaitulMal/BaitulMal.vue'
import MasjidProject from './MasjidProject/MasjidProject.vue'
import MasjidTableBank from './MasjidTableBank/MasjidTableBank.vue'

export default {
  components: {
      BaitulMal,
      MasjidProject,
      MasjidTableBank
  },
  data() {
      return {
            tab: null,
            items: ['BaitulMal', 'MasjidProject', 'MasjidTableBank']
      }
  },
  mounted() {
      if(this.$route.name === 'Baitulmal') document.querySelectorAll('.my_tab')[0].click()
      else if(this.$route.name === 'Masjid Project') document.querySelectorAll('.my_tab')[1].click()
      else if(this.$route.name === 'Masjid Table Bank') document.querySelectorAll('.my_tab')[2].click()
  },
}
</script>