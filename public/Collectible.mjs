import gameSettings from "./gameSettings.mjs"


class Collectible {
  constructor({ x: x, y: y, id: id }) {
    if (!x){
      x = random(0,(gameSettings.boardWidth-gameSettings.padding))
    }
    if (!y){
      y = random(gameSettings.bannerHeight,(gameSettings.boardHeight-gameSettings.padding))
    }
    
    this.x = x
    this.y = y
    this.value=1
    this.id=id
  }
  setNew({ x: x, y: y, id: id }){
    if (!x){
      x = random(0,(gameSettings.boardWidth-gameSettings.padding))
    }
    if (!y){
      y = random(gameSettings.bannerHeight,(gameSettings.boardHeight-gameSettings.padding))
    }
    this.x = x
    this.y = y
    this.value=1
    
    this.id=id
    return this
  }

}
function random(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
