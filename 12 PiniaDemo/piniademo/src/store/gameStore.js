import { defineStore } from "pinia";

export const useGameStore = defineStore("gameStore", {
  state: () => ({
    score: 50,
    maxHealth: 100,
    maxAttack: 30,
    maxDefense: 10,
  }),
  getters: {
    getScore() {
      return this.score;
    },
  },
  actions: {
    setNextAttack() {
      let attack = Math.floor(Math.random() * this.maxAttack) + 1;
      console.log("attack", attack);
      this.score += attack;
    },
    setNextDefense() {
      let defence = Math.floor(Math.random() * this.maxDefense) + 1;
      console.log("defence", defence);
      this.score -= defence;
    },
    resetScore() {
      this.score = 50;
    },
  },
});
