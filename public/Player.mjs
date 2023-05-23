import gameSettings from "./gameSettings.mjs"

class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y=y;
    this.score=score;
    this.id=id
  }

  movePlayer(dir, speed) {
    if (dir=='left'){
      this.x = this.x - speed
    }
    if (dir=='right'){
      this.x = this.x + speed
    }
    else if (dir=='down'){
      this.y = this.y + speed
    }
    else if (dir=='up'){
      this.y = this.y - speed
    }
  }

  collision(col) {
    if (this.x>=(col.x-gameSettings.playerSprite.width) && this.y>=col.y-gameSettings.playerSprite.height && this.x<=(col.x+gameSettings.collectableSprite.width) && this.y<=(col.y+gameSettings.collectableSprite.height)){
      this.score++
      return true
    }
    return false
  }

  calculateRank(opp) {
    let totalPlayers = opp.length
    let c=0
    opp.forEach(o=>{
      if (this.id!=o.id){
        if (this.score>=o.score){
          c++
        }
      }
      
    })
    let rank = totalPlayers -c
    return `Rank: ${rank} / ${totalPlayers}`;
    //return 'Rank: '+rank+' / '+totalPlayers
  }
}

export default Player;
