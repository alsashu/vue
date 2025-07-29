import { defineStore, getActivePinia } from "pinia";
import { computed, ref } from "vue";


/**
 * composition api
 */
export const useGameStore = defineStore("gameStore",()=> {

    const score =ref(50);
    const maxHealth=ref(100);
    const maxAttack=ref(30);
    const maxDefense=ref(10);

    const getScore = computed(()=>score.value);
    const getWinningScore = computed(()=>maxHealth.value);

    setNextAttack() =()=>{
      let attack = Math.floor(Math.random() * maxAttack.value) + 1;
      console.log("attack", attack);
      score.value += attack;
    };

    setNextDefense=()=> {
      let defence = Math.floor(Math.random() * maxDefense.value) + 1;
      console.log("defence", defence);
      score.value -= defence;
    };

    resetScore=()=> {
      score.value = 50;
    };

    return{
      score,maxHealth,maxAttack,maxDefense,getScore,getWinningScore,setNextAttack,setNextDefense,resetScore
    }
  });

/**
 * options api
 */

// export const useGameStore = defineStore("gameStore", {
//   state: () => ({
//     score: 50,
//     maxHealth: 100,
//     maxAttack: 30,
//     maxDefense: 10,
//   }),
//   getters: {
//     getScore() {
//       return this.score;
//     },
//     getWinningScore() {
//       return this.maxHealth;
//     },
//   },
//   actions: {
//     setNextAttack() {
//       let attack = Math.floor(Math.random() * this.maxAttack) + 1;
//       console.log("attack", attack);
//       this.score += attack;
//     },
//     setNextDefense() {
//       let defence = Math.floor(Math.random() * this.maxDefense) + 1;
//       console.log("defence", defence);
//       this.score -= defence;
//     },
//     resetScore() {
//       this.score = 50;
//     },
//   },
// });
