/** @format */
const display_dom = document.querySelector("#display");
const nextStake_input = document.querySelector("#nextStake_input");
const expiredBetSlipsTbody = document.querySelector("#expired-bet-slips-tbody");
const liveGameTbody = document.querySelector("#live-game-tbody");
const newOddInput = document.querySelector("#newOdd-input");
const initialUnits_dom = document.querySelector("#initial-units");
const initialUnits_input = document.querySelector("#initial-stake-input");
const targetProfitDisplay = document.querySelector("#target-profit-display");
const unitsDisplay = document.querySelector("#units-display");
const nextStakeDisplay = document.querySelector("#next-stake-display");
const processInfo = document.querySelector("#process-info");
const amountToRebetInput = document.querySelector("#amount-to-rebet-input");
const compoundingStatus_dom = document.querySelectorAll(".compounding-status");
const overallProfit_dom = document.querySelector("#overall-profit");

let data = getSavedData();

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
let expiredBetSlips =
  data && data.expiredBetSlips.length > 0 ? data.expiredBetSlips : [];
let overAllProfit = data ? data.overAllProfit : 0;
let targetProfit = 0;
let liveGame = data ? data.liveGame : {};
let isCompoundBettingEnbled = data ? data.isCompoundBettingEnbled : false;
let percentageToRebet = data ? data.percentageToRebet : 0;

function selectUnits() {
  const values = nextStake_input.value.split(",");

  const convertedArray = values.map((value) => {
    return value * 1;
  });

  if (!isSubset(units, convertedArray)) {
    alert("bad nextStake input");
    return;
  }

  recoverList = convertedArray;

  if (isCompoundBettingEnbled && overAllProfit > 0) {
    nextStake =
      (getArraySum(recoverList) + percentageToRebet * overAllProfit) /
      (odd - 1);
  } else {
    nextStake = getArraySum(recoverList) / (odd - 1);
  }

  nextStake = nextStake.toFixed(2) * 1;

  render();
}

function setNextStake() {
  nextStake = getArraySum(recoverList);
}

function stake() {
  let value = nextStake_input.value;
  value = value.trim();

  if (value == 0 || nextStake == 0) {
    alert("you can't place an empty bet, input select units first");
    return;
  }

  if (isNaN(nextStake)) {
    alert("invalid nextstake value '?' ,input select units first");
    return;
  }

  isBetStaked = true;
  stakeAmount = nextStake;
  gameOutcome = "pending";
  let profit = "?";

  let game = {
    stakeAmount,
    odd,
    gameOutcome,
    profit,
  };

  liveGame = game;

  setLiveGameTbody(liveGame);

  stakeAmount = nextStake;
  //removeUnits(units,recoverList)
  saveData();
  render();
}

function setLiveGameTbody(liveGame) {
  liveGameTbody.innerHTML = `<tr>
  <td>${1}</td>
  <td>${liveGame.stakeAmount}</td>
  <td>${liveGame.odd}</td>
  <td>${liveGame.gameOutcome}</td>
  <td>${liveGame.profit}</td>
  </tr>`;
}

function won() {
  if (!liveGame.gameOutcome) {
    alert("sorry, you haven't stake a bet yet");
    return;
  }

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
  expiredBetSlips.push(game);
  overAllProfit = calcProfit();

  wonGames[wonGames.length - 1].profit = overAllProfit;

  units = removeUnits(units, recoverList);
  nextStake = "?";

  liveGame = {};
  render();

  saveData();
}

function lost() {
  if (!liveGame.gameOutcome) {
    alert("sorry, you haven't stake a bet yet");
    return;
  }

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
  expiredBetSlips.push(game);
  overAllProfit = calcProfit();

  lostGames[lostGames.length - 1].profit = overAllProfit;

  units.push(stakeAmount);
  nextStake = "?";

  liveGame = {};
  render();

  saveData();
}

function clearLiveGameTbody() {
  liveGameTbody.innerHTML = "you have not stake a bet / game yet";
}
clearLiveGameTbody();

function calcProfit() {
  const totalWonStakes = getTotalStakeAmounts(wonGames);
  const totalStakes = getTotalStakeAmounts(expiredBetSlips);

  let result = odd * totalWonStakes - totalStakes;
  result = result.toFixed(2) * 1;
  return result;
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

  if (expiredBetSlips.length == 0) {
    odd = value;
  } else {
    alert("sorry,can't new odd ,you have an online bet");
  }
  saveData();
  alert(`odd set too ${odd}`);
  location.reload();
}

function setInitialUnits() {
  if (!(expiredBetSlips.length < 1)) {
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

function enableCompoundBetting() {
  let value = amountToRebetInput.value;
  value = value * 1;
  if (isNaN(value)) {
    alert("bad input");
    return;
  }

  if (value == 0) {
    alert("zero is not allowed");
    return;
  }

  isCompoundBettingEnbled = !isCompoundBettingEnbled;

  if (isCompoundBettingEnbled == false) {
    percentageToRebet = 0;
    alert("compound betting disabled");

    render();
    return;
  }

  targetProfitDisplay.innerText = "infite";

  percentageToRebet = value;
  alert("Success,Compound betting Enabled");

  saveData();
  render();
}

function showCompoundingStatus() {
  if (isCompoundBettingEnbled) {
    compoundingStatus_dom.forEach((e) => {
      e.innerText = "Enabled";
      e.classList.remove("disabled");
      e.classList.add("enabled");
    });
  } else {
    compoundingStatus_dom.forEach((e) => {
      e.innerText = "Disabled";
      e.classList.remove("enabled");
      e.classList.add("disabled");
    });
  }
}

function render() {
  expiredBetSlipsTbody.innerHTML = "";
  display_dom.innerText = JSON.stringify({
    units,
    recoverList,
    nextStake,
    odd,
    isBetStaked,
    stakeAmount,
    gameOutcome,
    overAllProfit,
    percentageToRebet,
    isCompoundBettingEnbled,
  });

  let content = "";
  expiredBetSlips.forEach((deadGame, index) => {
    content += `<tr>
      <td>${index + 1}</td>
      <td>${deadGame.stakeAmount}</td>
      <td>${deadGame.odd}</td>
      <td>${deadGame.gameOutcome}</td>
      <td>${deadGame.profit}</td>
    </tr>`;
  });

  expiredBetSlipsTbody.innerHTML = content;

  initialUnits_dom.innerText = initialUnits;
  targetProfitDisplay.innerText = getTargetProfit();
  unitsDisplay.innerText = units;
  nextStakeDisplay.innerText = nextStake;
  if (liveGame.gameOutcome) {
    setLiveGameTbody(liveGame);
  } else {
    clearLiveGameTbody();
  }
  showCompoundingStatus();
  overallProfit_dom.innerText = overAllProfit;
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
    expiredBetSlips,
    liveGame,
    overAllProfit,
    isCompoundBettingEnbled,
    percentageToRebet,
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
  const confirm = prompt(
    "if you really want to SAVE_DATA_TO_ONLINE , types 'yes"
  ).trim();
  if (confirm == "" || confirm != "yes") {
    return (processInfo.innerText = "operation aborted");
  }

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
  const confirm = prompt(
    "if you really want to SyncToLocalStorage , types 'yes"
  ).trim();
  if (confirm == "" || confirm != "yes") {
    return (processInfo.innerText = "operation aborted");
  }

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
