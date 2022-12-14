const display_dom = document.querySelector("#display");
const nextStake_input = document.querySelector("#nextStake_input");
const tbody = document.querySelector("#tbody");
const newOddInput = document.querySelector("#newOdd-input");


let odd = 2;
let units = [1,2,2,3,4,5];
let nextStake = 0;
let isBetStaked = false;
let gameOutcome = "";
let stakeAmount = 0;
let recoverList = [];
let wonGames = [];
let lostGames = [];
let deadGames = [];
let profit = 0;


function setNextStakeFromInput(){
  
  const values = nextStake_input.value.split(",");
  
  const convertedArray = values.map((value)=>{
    return value*1
  })
  
  
  if(!isSubset(units,convertedArray)){
    alert("bad nextStake input")
    return
  };
  
  recoverList = convertedArray;
 

  nextStake = (getArraySum(recoverList)/(odd-1) )
  nextStake = nextStake.toFixed(2) *1;
  
  render()
}

function setNextStake(){
  nextStake = getArraySum(recoverList)
}

function stake(){
  isBetStaked = true;
  stakeAmount = nextStake;
  gameOutcome = "pending"
  
  stakeAmount = nextStake;
  //removeUnits(units,recoverList) 

  render()
}

function won(){
  stake();
  gameOutcome = "won"
  
  if(isString(nextStake)){
    alert("nextStake can't be ?");
    return
  }
  
  let game = {
    stakeAmount ,
    odd,
    gameOutcome
  }
  wonGames.push(game)
  
  //adding game profit
  deadGames.push(game)
  profit = calcProfit();
  
  wonGames[wonGames.length-1].profit = profit;

  units = removeUnits(units,recoverList)
  nextStake = "?"
  render()
  
}

function lost(){
  stake()
  gameOutcome = "lost";
  
  if(isString(nextStake)){
    alert("nextStake can't be ?");
    return
  }
  
  let game = {
    stakeAmount ,
    odd,
    gameOutcome
  }
  lostGames.push(game)
  deadGames.push(game)
  profit = calcProfit()
  
 
  lostGames[lostGames.length-1].profit = profit;
  
  
  units.push(stakeAmount)
  nextStake = "?"
  render()
  
}

function calcProfit(){
  const totalWonStakes = getTotalStakeAmounts(wonGames);
  const totalStakes = getTotalStakeAmounts(deadGames);
  
  
  return (odd*totalWonStakes) - totalStakes
  

}

function getTotalStakeAmounts(games){
  games = [...games]
  let sum = 0
  
  games.forEach(game=>{
     sum += game.stakeAmount;
  })
  
  return sum;
}

function setNewOdd(){
  let value = newOddInput.value*1;
  console.log(value)
  if(value == 0){
    alert("sorry, odd can't be empty")
    return
  }
  
  if(isNaN(value)){
    alert("sorry, only numbers allowed")
    return
  }
  
  
  
  if(deadGames.length  == 0){
    
    odd = value;
    console.log(odd)
  }else{
    alert("sorry,can't new odd ,you have an online bet")
  }
  render()
}


function render(){
  tbody.innerHTML = ""
  display_dom.innerText = JSON.stringify( {
    units,
    recoverList,
    nextStake,
    odd,
    isBetStaked,
    stakeAmount,
    gameOutcome,
    profit
  })
  
  let content = "";
  deadGames.forEach((deadGame,index)=>{
    content += `<tr>
      <td>${index + 1}</td>
      <td>${deadGame.stakeAmount}</td>
      <td>${deadGame.odd}</td>
      <td>${deadGame.gameOutcome}</td>
      <td>${deadGame.profit}</td>
    </tr>`
  })
  
  tbody.innerHTML = content
  
}
render()




function getArraySum(arr){
  arr = [...arr]
  let sum = 0;
  arr.forEach((el=>{
    sum += el
  }))
  return sum
}



function removeUnits(units,unitsToRemove){
  units = [...units];
  unitsToRemove = [...unitsToRemove]
  
    if(isSubset(units,unitsToRemove)){
      
      
      unitsToRemove.forEach((el)=>{
        const index = units.indexOf(el);
        units.splice(index,1)
      })
      
      
      
    }else{
      alert("bad next stake input")
    }
   

  
  return units
}



const isSubset = (array1, array2) => array2.every((element) => array1.includes(element));

function isString(str){
  if(typeof(str) == "string"){
    return true
  }else{
    return false
  }
}


