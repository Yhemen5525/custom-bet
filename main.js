/** @format */

const display_dom = document.querySelector("#display");
const nextStake_input = document.querySelector("#nextStake_input");
const tbody = document.querySelector("#tbody");
const newOddInput = document.querySelector("#newOdd-input");
const initialUnits_dom = document.querySelector("#initial-units");
const initialUnits_input = document.querySelector("#initial-stake-input");
const targetProfitDisplay = document.querySelector("#target-profit-display");
const unitsDisplay = document.querySelector("#units-display");
const nextStakeDisplay = document.querySelector("#next-stake-display");
const processInfo = document.querySelector("#process-info");

let data = getSavedData();
// console.log(data);

let odd = data ? data.odd : 2;
let initialUnits =
  data && data.initialUnits.length > 0 ? data.initialUnits : [1, 2, 2, 3, 4, 5];
let units = data && data.units.length > 0 ? data.units : [...initialUnits];
let nextStake = data ? data.nextStake : 0;
let isBetStaked = data ? data.isBetStaked : false;
let gameOutcome = data ? data.gameOutcome : "";
let stakeAmount = data ? data.stakeAmount : 0;
let recoverList = data && data.recoverList > 0 ? data.recoverList : [];
let wonGames = data && data.wonGames.length > 0 ? data.wonGames : [];
let lostGames = data && data.lostGames.length > 0 ? data.lostGames : [];
let deadGames = data && data.deadGames.length > 0 ? data.deadGames : [];
let profit = data ? data.profit : 0;
let targetProfit = 0;

function setNextStakeFromInput() {
  const values = nextStake_input.value.split(",");

  const convertedArray = values.map((value) => {
    return value * 1;
  });

  if (!isSubset(units, convertedArray)) {
    alert("bad nextStake input");
    return;
  }

  recoverList = convertedArray;

  nextStake = getArraySum(recoverList) / (odd - 1);
  nextStake = nextStake.toFixed(2) * 1;

  render();
}

function setNextStake() {
  nextStake = getArraySum(recoverList);
}

function stake() {
  isBetStaked = true;
  stakeAmount = nextStake;
  gameOutcome = "pending";

  stakeAmount = nextStake;
  //removeUnits(units,recoverList)

  render();
}

function won() {
  stake();
  gameOutcome = "won";

  if (isString(nextStake)) {
    alert("nextStake can't be ?");
    return;
  }

  let game = {
    stakeAmount,
    odd,
    gameOutcome,
  };
  wonGames.push(game);

  //adding game profit
  deadGames.push(game);
  profit = calcProfit();

  wonGames[wonGames.length - 1].profit = profit;

  units = removeUnits(units, recoverList);
  nextStake = "?";
  render();

  saveData();
}

function lost() {
  stake();
  gameOutcome = "lost";

  if (isString(nextStake)) {
    alert("nextStake can't be ?");
    return;
  }

  let game = {
    stakeAmount,
    odd,
    gameOutcome,
  };
  lostGames.push(game);
  deadGames.push(game);
  profit = calcProfit();

  lostGames[lostGames.length - 1].profit = profit;

  units.push(stakeAmount);
  nextStake = "?";
  render();

  saveData();
}

function calcProfit() {
  const totalWonStakes = getTotalStakeAmounts(wonGames);
  const totalStakes = getTotalStakeAmounts(deadGames);

  return odd * totalWonStakes - totalStakes;
}

function getTargetProfit() {
  return getArraySum(initialUnits);
}

function getTotalStakeAmounts(games) {
  games = [...games];
  let sum = 0;

  games.forEach((game) => {
    sum += game.stakeAmount;
  });

  return sum;
}

function setNewOdd() {
  let value = newOddInput.value * 1;
  if (value == 0) {
    alert("sorry, odd can't be empty");
    return;
  }

  if (isNaN(value)) {
    alert("sorry, only numbers allowed");
    return;
  }

  if (deadGames.length == 0) {
    odd = value;
  } else {
    alert("sorry,can't new odd ,you have an online bet");
  }
  saveData();
  location.reload();
}

function setInitialUnits() {
  if (!(deadGames.length < 1)) {
    alert(
      "sorry, you have an on going bet, can't reassign unitialUnits now. clear data and try again"
    );
    return;
  }

  let values = initialUnits_input.value;
  values = values.split(",");

  let arrayOfNumbers = values.map((value) => {
    return value * 1;
  });
  values = arrayOfNumbers;
  initialUnits = values;
  initialUnits_dom.innerText = values;
  targetProfitDisplay.innerText = getTargetProfit();

  units = initialUnits;
  saveData();
  location.reload();
}

function render() {
  tbody.innerHTML = "";
  display_dom.innerText = JSON.stringify({
    units,
    recoverList,
    nextStake,
    odd,
    isBetStaked,
    stakeAmount,
    gameOutcome,
    profit,
  });

  let content = "";
  deadGames.forEach((deadGame, index) => {
    content += `<tr>
      <td>${index + 1}</td>
      <td>${deadGame.stakeAmount}</td>
      <td>${deadGame.odd}</td>
      <td>${deadGame.gameOutcome}</td>
      <td>${deadGame.profit}</td>
    </tr>`;
  });

  tbody.innerHTML = content;

  initialUnits_dom.innerText = initialUnits;
  targetProfitDisplay.innerText = getTargetProfit();
  unitsDisplay.innerText = units;
  nextStakeDisplay.innerText = nextStake;
}
render();

function getArraySum(arr) {
  arr = [...arr];
  let sum = 0;
  arr.forEach((el) => {
    sum += el;
  });
  return sum;
}

function removeUnits(units, unitsToRemove) {
  units = [...units];
  unitsToRemove = [...unitsToRemove];

  if (isSubset(units, unitsToRemove)) {
    unitsToRemove.forEach((el) => {
      const index = units.indexOf(el);
      units.splice(index, 1);
    });
  } else {
    alert("bad next stake input");
  }

  return units;
}

const isSubset = (array1, array2) =>
  array2.every((element) => array1.includes(element));

function isString(str) {
  if (typeof str == "string") {
    return true;
  } else {
    return false;
  }
}

function saveData() {
  let data = {
    odd,
    initialUnits,
    units,
    nextStake,
    isBetStaked,
    gameOutcome,
    stakeAmount,
    recoverList,
    wonGames,
    lostGames,
    deadGames,
    profit,
  };
  data = JSON.stringify(data);
  localStorage.setItem("customBetdata", data);
}

function getSavedData() {
  let data = localStorage.getItem("customBetdata");
  data = JSON.parse(data);

  if (!(data == "undefined")) {
    return data;
  } else {
    return undefined;
  }
}

function removeData() {
  localStorage.removeItem("customBetdata");
  location.reload();
}

async function saveOnline() {
  processInfo.innerText = "saving... data online";
  const url = "https://online-storage.up.railway.app/api/v1/data/";
  const config = {
    url,
    data: {
      id: "customBetdata",
      name: "data",
      value: localStorage.getItem("customBetdata"),
    },
    method: "POST",
  };

  try {
    const response = await axios(config);
    const data = response.data;

    processInfo.innerText = "synced to online database";
  } catch (error) {
    if (error.request) {
      processInfo.innerText = "no internet connection";
    }

    processInfo.innerText = error.message;
  }
}

// saveOnline();

async function syncToLocal() {
  processInfo.innerText = "Sync... to local";
  const url = "https://online-storage.up.railway.app/api/v1/data/customBetdata";

  try {
    const response = await axios.get(url);
    let data = response.data;

    data = data.data.value;
    localStorage.setItem("customBetdata", data);

    processInfo.innerText = "Synced to local";
  } catch (error) {
    if (error.request) {
      processInfo.innerText = "no internet connection";
      return;
    }

    processInfo.innerText = error.message;
  }
}

// syncToLocal();
