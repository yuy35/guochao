import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { GameState, Player, Enemy, GameLog, INITIAL_PLAYER, StatType, Item, Language } from './types';
import { generateScenario, generateLoot, generateBossDialogue, generateEnding, getZoneBoss, getFinalBoss } from './services/geminiService';
import { 
  HeartIcon, SparklesIcon, ArchiveBoxIcon, MapIcon, FireIcon, XMarkIcon, TrashIcon, PlayIcon, ArrowPathIcon, ExclamationTriangleIcon, StarIcon, CheckCircleIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/solid';

const MAX_LOGS = 50;
const SAVE_KEY = 'time_chaos_save_v1';

const TRANSLATIONS = {
  en: {
    startTitle: "Time Chaos",
    startDesc: "Roguelike RPG x Intangible Heritage",
    enterBtn: "Enter the Void",
    continueBtn: "Continue",
    playAgain: "Play Again",
    restart: "Restart",
    gameOver: "LOST IN TIME",
    gameOverDesc: "You became a time fragment.",
    explore: "Explore",
    attack: "ATTACK",
    flee: "FLEE",
    challengeBoss: "CHALLENGE BOSS",
    relicsEquipped: "Active Relics",
    noRelics: "No relics equipped.",
    bag: "Bag",
    autoEquip: "Equip All",
    equip: "Equip",
    unequip: "Unequip",
    delete: "Discard",
    zone: "Zone",
    runes: "Runes",
    hp: "HP",
    maxHp: "HP",
    level: "LV",
    levelUp: "Level Up!",
    foundItem: "Found:",
    bagFull: "Bag Full! (30/30) Item lost:",
    itemDeleted: "Discarded",
    fled: "You fled from battle!",
    dodged: "You dodged",
    hitsYou: "hits you for",
    damage: "damage",
    crit: "(CRITICAL!)",
    hitEnemy: "You hit",
    senseBoss: "You sense a powerful presence nearby...",
    bossEncounter: "Encountered",
    exploring: "Exploring...",
    timelineFlicker: "The timeline flickers. Try again.",
    challengeLog: "Challenging Zone",
    defeated: "Defeated",
    recovered: "Recovered",
    tookDamage: "Took",
    wait: "Wait",
    search: "Search",
    statUp: "Improved",
    atk: "ATK",
    def: "DEF",
    critStat: "CRIT",
    critDmg: "CDMG",
    dodge: "EVA",
    luck: "LUCK",
    empty: "Empty",
    bonusStats: "Equipped Bonuses",
    selectItem: "Select an item to view details",
    lootConflict: "Loot Conflict",
    bagFullDesc: "Bag is full.",
    discardNew: "Discard New",
    swapItem: "Swap with Bag Item",
    selectToReplace: "Select an item to discard and replace",
    confirmSwap: "CONFIRM SWAP",
    swapped: "Item swapped!",
    selectHeirloom: "Select Legacy Item",
    heirloomDesc: "Choose relic to inherit.",
    restartWithHeirloom: "Reincarnate with Legacy",
    bossFound: "BOSS FOUND",
    bossFoundDesc: "You discovered the lair of",
    cancelSwap: "Cancel Swap"
  },
  zh: {
    startTitle: "时空混乱",
    startDesc: "肉鸽 RPG x 非遗文化",
    enterBtn: "进入虚空",
    continueBtn: "继续",
    playAgain: "再玩一次",
    restart: "重新开始",
    gameOver: "迷失时空",
    gameOverDesc: "你变成了时间的碎片。",
    explore: "探索",
    attack: "攻击",
    flee: "逃跑",
    challengeBoss: "挑战区域BOSS",
    relicsEquipped: "激活非遗",
    noRelics: "未装备非遗文物。",
    bag: "背包",
    autoEquip: "一键全部装备",
    equip: "装备",
    unequip: "卸下",
    delete: "丢弃",
    zone: "区域",
    runes: "时空秘符",
    hp: "生命",
    maxHp: "生命",
    level: "等级",
    levelUp: "升级！",
    foundItem: "获得文物：",
    bagFull: "背包已满(30/30)！",
    itemDeleted: "已丢弃",
    fled: "你逃离了战斗！",
    dodged: "你躲开了",
    hitsYou: "击中了你，造成",
    damage: "伤害",
    crit: "(暴击!)",
    hitEnemy: "你击中了",
    senseBoss: "你感觉到附近有一股强大的气息...",
    bossEncounter: "遭遇了",
    exploring: "探索中...",
    timelineFlicker: "时间线闪烁不定。请重试。",
    challengeLog: "挑战区域",
    defeated: "击败了",
    recovered: "恢复了",
    tookDamage: "受到了",
    wait: "等待",
    search: "搜索",
    statUp: "提升了",
    atk: "攻击",
    def: "防御",
    critStat: "暴击",
    critDmg: "爆伤",
    dodge: "闪避",
    luck: "幸运",
    empty: "空",
    bonusStats: "装备加成",
    selectItem: "点击物品查看详情",
    lootConflict: "发现宝物",
    bagFullDesc: "背包已满。",
    discardNew: "丢弃新物品",
    swapItem: "替换背包物品",
    selectToReplace: "请选择一个物品进行替换",
    confirmSwap: "确认替换",
    swapped: "物品已替换！",
    selectHeirloom: "选择传承遗物",
    heirloomDesc: "选择一件非遗在来世继承。",
    restartWithHeirloom: "携带传承重生",
    bossFound: "发现BOSS",
    bossFoundDesc: "你发现了区域领主的巢穴：",
    cancelSwap: "取消替换"
  }
};

export default function App() {
  // --- LOAD SAVE DATA ---
  const [saveData] = useState(() => {
      if (typeof window === 'undefined') return null;
      try {
          const item = localStorage.getItem(SAVE_KEY);
          return item ? JSON.parse(item) : null;
      } catch { return null; }
  });

  const [language, setLanguage] = useState<Language>(saveData?.language || 'zh');
  const [gameState, setGameState] = useState<GameState>(saveData?.gameState || GameState.START);
  
  // Use spread to ensure new fields in INITIAL_PLAYER are respected if save is old
  const [player, setPlayer] = useState<Player>(saveData?.player ? { ...INITIAL_PLAYER, ...saveData.player } : INITIAL_PLAYER);
  const [logs, setLogs] = useState<GameLog[]>(saveData?.logs || []);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(saveData?.currentEnemy || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentChoices, setCurrentChoices] = useState<any[]>(saveData?.currentChoices || []);
  const [storyText, setStoryText] = useState<string>(saveData?.storyText || "");
  const [endingData, setEndingData] = useState<{title: string, content: string} | null>(saveData?.endingData || null);
  
  const [showBag, setShowBag] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pendingLoot, setPendingLoot] = useState<Item | null>(saveData?.pendingLoot || null); 
  
  // LEGACY
  const [inheritedItem, setInheritedItem] = useState<Item | null>(saveData?.inheritedItem || null);
  const [selectedHeirloomId, setSelectedHeirloomId] = useState<string | null>(saveData?.selectedHeirloomId || null);

  // COMBAT ANIMATION STATE
  const [combatAnim, setCombatAnim] = useState<'idle' | 'playerAttack' | 'enemyHit' | 'playerHit'>('idle');

  const t = TRANSLATIONS[language];
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- AUTO SAVE EFFECT ---
  useEffect(() => {
    const dataToSave = {
        language,
        gameState,
        player,
        logs,
        currentEnemy,
        currentChoices,
        storyText,
        endingData,
        pendingLoot,
        inheritedItem,
        selectedHeirloomId
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  }, [language, gameState, player, logs, currentEnemy, currentChoices, storyText, endingData, pendingLoot, inheritedItem, selectedHeirloomId]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (text: string, type: GameLog['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-49), { id: crypto.randomUUID(), text, type }]);
  };

  const renderLogText = (text: string) => {
    const parts = text.split(/(<c:[a-z]+>.*?<\/c>)/g);
    return parts.map((part, i) => {
        const match = part.match(/<c:([a-z]+)>(.*?)<\/c>/);
        if (match) {
            const color = match[1]; 
            const content = match[2];
            let className = "text-gray-400";
            if (color === 'orange') className = "text-orange-500 font-bold";
            if (color === 'blue') className = "text-blue-400 font-bold";
            if (color === 'green') className = "text-green-400 font-bold";
            if (color === 'gray') className = "text-gray-400 font-bold";
            return <span key={i} className={className}>{content}</span>;
        }
        return part;
    });
  };

  const getExtraStat = (inv: Item[], stat: StatType): number => {
    return inv.filter(i => i.isEquipped).reduce((acc, i) => acc + (i.stats[stat] || 0), 0);
  };

  // --- Actions ---

  const resetGame = () => {
    let startingInv: Item[] = [];
    if (selectedHeirloomId) {
        const heirloom = player.inventory.find(i => i.id === selectedHeirloomId);
        if (heirloom) {
            startingInv = [{ ...heirloom, isEquipped: true }];
        }
    }
    
    let nextLuck = player.luck;
    if (gameState === GameState.ENDING) {
        nextLuck += 1;
    }

    setPlayer({ ...INITIAL_PLAYER, inventory: startingInv, luck: nextLuck });
    setLogs([]);
    setCurrentEnemy(null);
    setLoading(false);
    setCurrentChoices([]);
    setStoryText("");
    setEndingData(null);
    setGameState(GameState.START);
    setShowBag(false);
    setSelectedItemId(null);
    setPendingLoot(null);
    setSelectedHeirloomId(null);
    setCombatAnim('idle');
  };

  const startGame = () => {
    setGameState(GameState.INTRO);
    if (language === 'zh') {
        setStoryText("主角走在长辛店国潮街误触机关，掉入了一个时空混乱的世界，在这里主角发现时间错乱，有过去有未来，时空变得混乱...");
    } else {
        setStoryText("You are walking down Changxindian Guochao Street. Suddenly, you step on a loose paving stone. A mechanical click resonates. The world spins. Colors bleed into one another. You fall into a void...");
    }
  };

  const advanceToIntro2 = () => {
     if (language === 'zh') {
        setStoryText("脑子里有个声音响起“原来主角无意中引发了时间混乱，只有收集到6个时空秘符才能离开这里，这里充斥着大量靠吞噬时间碎片的魔物，而时空秘符正是被这些魔物吞噬掉了，主角能做的只有通过武力干掉他们，夺回时空秘符”");
     } else {
        setStoryText("A voice echoes in your head: 'You have triggered the Time Chaos. Six Time Runes have been devoured by Time Monsters. The timeline is collapsing. Defeat the six guardians, retrieve the runes, and restore order.'");
     }
     setGameState(GameState.EXPLORE);
  };

  const handleExplore = async () => {
    setLoading(true);
    const nextExplorationCount = player.explorationsInCurrentZone + 1;
    
    // BOSS DISCOVERY LOGIC
    if (!player.bossLocated && nextExplorationCount >= 10) {
        setTimeout(() => {
             const bossInfo = getZoneBoss(player.currentZone, language, player.luck);
             const discoveryText = language === 'zh' 
                ? `经过一番探索，你终于发现了区域 ${player.currentZone} 的领主——${bossInfo.name} 的巢穴！\n现在你可以随时向其发起挑战。`
                : `After much exploration, you finally discovered the lair of the Zone ${player.currentZone} Lord — ${bossInfo.name}!\nYou can now challenge them at any time.`;
             
             setStoryText(discoveryText);
             addLog(`${t.bossFound}: ${bossInfo.name}`, 'danger');
             
             setPlayer(p => ({
                 ...p, 
                 explorationsInCurrentZone: nextExplorationCount, 
                 bossLocated: true 
             }));
             setCurrentChoices([]); 
             setGameState(GameState.EXPLORE);
             setLoading(false);
        }, 500);
        return;
    }

    // Normal Exploration
    try {
      const scenario = await generateScenario(player, language);
      setStoryText(scenario.description);
      
      if (scenario.hasCombat) {
        const enemy: Enemy = {
          name: scenario.enemyName || "Glitch",
          description: scenario.enemyDesc || "...",
          hp: scenario.enemyHp || 50,
          maxHp: scenario.enemyHp || 50,
          atk: scenario.enemyAtk || 5,
          isBoss: scenario.isBoss || false,
          dropRate: 0.3
        };
        setCurrentEnemy(enemy);
        setGameState(GameState.COMBAT);
        addLog(`${t.bossEncounter} ${enemy.name}!`, 'danger');
      } else {
        setCurrentChoices(scenario.eventChoices);
        setGameState(GameState.EXPLORE); 
      }
      setPlayer(p => ({...p, explorationsInCurrentZone: nextExplorationCount}));

    } catch (e) {
      addLog(t.timelineFlicker, 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleEventChoice = async (choice: any) => {
    addLog(choice.outcomeDescription, 'narrative');
    
    const xpGain = choice.expChange;
    
    let newLevel = player.level;
    let newExp = player.exp + xpGain;
    let leveledUp = false;
    
    if (newExp >= newLevel * 100) {
        newExp -= newLevel * 100;
        newLevel++;
        leveledUp = true;
    }

    let updatedPlayer = {
        ...player,
        exp: newExp,
        level: newLevel,
        maxHp: leveledUp ? player.maxHp + 20 : player.maxHp,
        atk: leveledUp ? (player.atk || 10) + 5 : (player.atk || 10),
        def: leveledUp ? (player.def || 5) + 2 : (player.def || 5),
    };

    const extraHp = getExtraStat(updatedPlayer.inventory, StatType.HP);
    const totalMaxHp = updatedPlayer.maxHp + extraHp;

    if (leveledUp) {
        updatedPlayer.currentHp = totalMaxHp;
        addLog(`${t.levelUp} ${t.level} ${newLevel}.`, 'gain');
    } else {
        if (choice.hpChange !== 0) {
            updatedPlayer.currentHp = Math.min(totalMaxHp, Math.max(0, player.currentHp + choice.hpChange));
            if (choice.hpChange < 0) addLog(`${t.tookDamage} ${Math.abs(choice.hpChange)} ${t.damage}.`, 'danger');
            if (choice.hpChange > 0) addLog(`${t.recovered} ${choice.hpChange} ${t.hp}.`, 'gain');
        } else {
            updatedPlayer.currentHp = player.currentHp;
        }
    }

    if (choice.statId && choice.statId !== 'NONE' && choice.statValue !== 0) {
        const statName = choice.statId;
        const statVal = choice.statValue;
        
        if (statName === 'ATK') updatedPlayer.atk += statVal;
        if (statName === 'DEF') updatedPlayer.def += statVal;
        if (statName === 'DODGE') updatedPlayer.dodge += statVal;
        if (statName === 'CRIT_RATE') updatedPlayer.critRate += statVal;
        if (statName === 'CRIT_DMG') updatedPlayer.critDmg += statVal;
        // Fix for Luck Stat update
        if (statName === 'LUCK') updatedPlayer.luck += statVal;
        
        // Format log: If percentage stat, show %
        let displayVal = statVal > 0 ? `+${statVal}` : `${statVal}`;
        if (['CRIT_RATE', 'CRIT_DMG', 'DODGE'].includes(statName)) {
             displayVal = statVal > 0 ? `+${(statVal * 100).toFixed(0)}%` : `${(statVal * 100).toFixed(0)}%`;
        }
        
        addLog(`${t.statUp} ${statName} ${displayVal}`, 'gain');
    }

    if (choice.getRelic) {
        const item = await generateLoot(updatedPlayer.level, language, updatedPlayer.luck);
        if (updatedPlayer.inventory.length >= 30) {
             setPendingLoot(item);
        } else {
            updatedPlayer.inventory = [...updatedPlayer.inventory, item];
            const color = item.rarity === 'Legendary' ? 'orange' : item.rarity === 'Epic' ? 'blue' : item.rarity === 'Rare' ? 'green' : 'gray';
            addLog(`${t.foundItem} <c:${color}>${item.name}</c>`, 'gain');
        }
    }

    setPlayer(updatedPlayer);
    setCurrentChoices([]);
    setStoryText("");
  };

  const handleChallengeBoss = () => {
      const bossInfo = getZoneBoss(player.currentZone, language, player.luck);
      const boss: Enemy = {
          name: bossInfo.name,
          description: bossInfo.description,
          hp: bossInfo.hp,
          maxHp: bossInfo.hp,
          atk: bossInfo.atk,
          isBoss: true,
          dropRate: 1.0
      };
      
      setCurrentEnemy(boss);
      setGameState(GameState.COMBAT);
      setStoryText(language === 'zh' 
        ? `你上前挑战 ${bossInfo.name}。空气变得凝重。`
        : `You step forward to challenge the ${bossInfo.name}. The air grows heavy.`);
      addLog(`${t.challengeLog} ${player.currentZone}: ${bossInfo.name}!`, 'danger');
  };

  const handleCombatAction = async () => {
    if (!currentEnemy || combatAnim !== 'idle') return;

    // 1. Player Attack Animation Phase
    setCombatAnim('playerAttack');
    await new Promise(r => setTimeout(r, 150)); // Wait for lunge visual

    // Fix: Explicitly cast to Number to prevent TypeScript errors about arithmetic on non-number types (e.g. from JSON state)
    const totalAtk = (Number(player.atk) || 10) + getExtraStat(player.inventory, StatType.ATK);
    const critRate = Number(player.critRate) + getExtraStat(player.inventory, StatType.CRIT_RATE);
    const critDmg = Number(player.critDmg) + getExtraStat(player.inventory, StatType.CRIT_DMG);
    
    const isCrit = Math.random() < critRate;
    const damage = Math.floor(Number(totalAtk) * (isCrit ? Number(critDmg) : 1) * (0.9 + Math.random() * 0.2));
    const newEnemyHp = currentEnemy.hp - damage;

    // 2. Enemy Hit Phase (Direct transition for impact feel)
    if (damage > 0) {
        setCombatAnim('enemyHit');
    }
    addLog(`${t.hitEnemy} ${currentEnemy.name} ${damage} ${t.damage}! ${isCrit ? t.crit : ''}`, 'combat');
    
    if (damage > 0) {
       await new Promise(r => setTimeout(r, 400)); // Shake duration
    }
    setCombatAnim('idle');

    if (newEnemyHp <= 0) {
        handleVictory(currentEnemy);
        return;
    }

    // 3. Enemy Counter-Attack (Delay slightly)
    await new Promise(r => setTimeout(r, 200));

    const dodgeRate = Number(player.dodge) + getExtraStat(player.inventory, StatType.DODGE);
    const totalDef = Number(player.def) + getExtraStat(player.inventory, StatType.DEF);

    if (Math.random() < dodgeRate) {
        addLog(`${t.dodged} ${currentEnemy.name}!`, 'info');
        setCurrentEnemy({...currentEnemy, hp: newEnemyHp});
    } else {
        const enemyDmg = Math.max(1, Math.floor(currentEnemy.atk - (totalDef * 0.5)));
        const newPlayerHp = player.currentHp - enemyDmg;

        setCombatAnim('playerHit');
        await new Promise(r => setTimeout(r, 400)); // Player Shake
        setCombatAnim('idle');

        addLog(`${currentEnemy.name} ${t.hitsYou} ${enemyDmg} ${t.damage}.`, 'danger');
        
        if (newPlayerHp <= 0) {
            setPlayer(p => ({...p, currentHp: 0}));
            setGameState(GameState.GAME_OVER);
        } else {
             setPlayer(p => ({...p, currentHp: newPlayerHp}));
             setCurrentEnemy({...currentEnemy, hp: newEnemyHp});
        }
    }
  };

  const handleVictory = async (enemy: Enemy) => {
      addLog(`${t.defeated} ${enemy.name}!`, 'gain');
      setCurrentEnemy(null);
      setCombatAnim('idle');
      
      const xpGain = enemy.isBoss ? 500 : 50;
      let newLevel = player.level;
      let newExp = player.exp + xpGain;
      let leveledUp = false;
      
      if (newExp >= newLevel * 100) {
          newExp -= newLevel * 100;
          newLevel++;
          leveledUp = true;
          addLog(t.levelUp, 'gain');
      }

      let newInventory = [...player.inventory];
      if (Math.random() < enemy.dropRate) {
          const item = await generateLoot(player.level, language, player.luck);
          if (newInventory.length >= 30) {
               setPendingLoot(item);
          } else {
              newInventory.push(item);
              const color = item.rarity === 'Legendary' ? 'orange' : item.rarity === 'Epic' ? 'blue' : item.rarity === 'Rare' ? 'green' : 'gray';
              addLog(`${t.foundItem} <c:${color}>${item.name}</c>`, 'gain');
          }
      }

      if (enemy.isFinalBoss) {
          setPlayer(p => ({...p, level: newLevel, exp: newExp, inventory: newInventory}));
          setLoading(true);
          const ending = await generateEnding(player.truthScore, language);
          setEndingData(ending);
          setGameState(GameState.ENDING);
          setLoading(false);
          return;
      }

      setPlayer(p => {
          const nextPlayer = {
              ...p,
              exp: newExp,
              level: newLevel,
              inventory: newInventory,
              maxHp: leveledUp ? p.maxHp + 20 : p.maxHp,
              atk: leveledUp ? (p.atk || 10) + 5 : (p.atk || 10),
              def: leveledUp ? (p.def || 5) + 2 : (p.def || 5),
          };

          const extraHp = getExtraStat(nextPlayer.inventory, StatType.HP);
          const totalMaxHp = nextPlayer.maxHp + extraHp;
          nextPlayer.currentHp = leveledUp ? totalMaxHp : p.currentHp;

          return nextPlayer;
      });

      if (enemy.isBoss) {
          setLoading(true);
          const dialogueData = await generateBossDialogue(player.currentZone, player.truthScore, language);
          setLoading(false);
          setStoryText(dialogueData.dialogue);
          setCurrentChoices(dialogueData.choices.map((c: any) => ({
              text: c.text,
              actionId: 'dialogue_choice',
              isTruthful: c.isTruthful
          })));
          setGameState(GameState.DIALOGUE);
      } else {
          setGameState(GameState.EXPLORE);
          setStoryText("");
      }
  };

  const handleDialogueChoice = async (choice: any) => {
      const newTruthScore = choice.isTruthful ? player.truthScore + 1 : player.truthScore;
      addLog(`> ${choice.text}`, 'narrative');
      setCurrentChoices([]); // Clear choices immediately to ensure Explore button renders in next state
      
      if (player.currentZone >= 6) {
          if (newTruthScore >= 4) {
              setPlayer(p => ({...p, truthScore: newTruthScore}));
              const finalBoss = getFinalBoss(player, language);
              setCurrentEnemy(finalBoss);
              setGameState(GameState.COMBAT);
              setStoryText(language === 'zh' 
                ? "时间线的尽头崩塌了... 一个由纯粹混乱构成的怪物从虚空中浮现！它就是这一切的源头——时间熵！"
                : "The timeline collapses at its end... A monster made of pure chaos emerges from the void! It is the source of everything — Time Entropy!");
              addLog(language === 'zh' ? "最终BOSS出现！" : "FINAL BOSS APPEARS!", 'danger');
          } else {
              setLoading(true);
              const ending = await generateEnding(newTruthScore, language);
              setEndingData(ending);
              setGameState(GameState.ENDING);
              setLoading(false);
          }
      } else {
          setPlayer(p => ({
              ...p,
              currentZone: p.currentZone + 1,
              truthScore: newTruthScore,
              explorationsInCurrentZone: 0,
              bossLocated: false
          }));
          addLog(`${t.zone} ${player.currentZone + 1}`, 'info');
          setGameState(GameState.EXPLORE);
          setStoryText("");
      }
  };

  const deleteItem = (itemId: string) => {
      const itemToDelete = player.inventory.find(i => i.id === itemId);
      if (!itemToDelete) return;

      if (itemToDelete.isEquipped && (itemToDelete.stats.HP || 0) > 0) {
         const hpLoss = itemToDelete.stats.HP || 0;
         setPlayer(p => ({
             ...p,
             currentHp: Math.max(1, p.currentHp - hpLoss)
         }));
      }

      setPlayer(p => ({
          ...p,
          inventory: p.inventory.filter(i => i.id !== itemId)
      }));
      
      // If pending loot exists, swap it in
      if (pendingLoot) {
          setPlayer(p => ({
              ...p,
              inventory: [...p.inventory.filter(i => i.id !== itemId), pendingLoot]
          }));
          addLog(t.swapped, 'gain');
          setPendingLoot(null);
          setShowBag(false);
      } else {
          addLog(`${t.itemDeleted}`, 'info');
      }
      setSelectedItemId(null);
  };

  const toggleEquip = (item: Item) => {
      // Clamp HP if unequipped
      if (item.isEquipped && (item.stats.HP || 0) > 0) {
          const hpLoss = item.stats.HP || 0;
          setPlayer(p => ({
              ...p,
              currentHp: Math.max(1, p.currentHp - hpLoss)
          }));
      }
      // Heal if equipped
      if (!item.isEquipped && (item.stats.HP || 0) > 0) {
          const hpGain = item.stats.HP || 0;
          setPlayer(p => ({
              ...p,
              currentHp: p.currentHp + hpGain
          }));
      }

      setPlayer(p => ({
          ...p,
          inventory: p.inventory.map(i => i.id === item.id ? { ...i, isEquipped: !i.isEquipped } : i)
      }));
  };
  
  const massEquip = () => {
      // Filter out items that are NOT equipped
      const itemsToEquip = player.inventory.filter(i => !i.isEquipped);
      if (itemsToEquip.length === 0) return;

      // Calculate total HP gain from these items
      const totalHpGain = itemsToEquip.reduce((acc, item) => acc + (item.stats.HP || 0), 0);

      setPlayer(p => ({
          ...p,
          currentHp: p.currentHp + totalHpGain,
          inventory: p.inventory.map(i => ({ ...i, isEquipped: true }))
      }));
      
      addLog(language === 'zh' ? "已装备所有物品！" : "Equipped all items!", 'info');
  };

  const renderHeirloomSelection = () => {
    return (
        <div className="mt-6 w-full max-w-sm">
            <h3 className="text-teal-400 font-bold mb-2 text-center text-sm">{t.selectHeirloom}</h3>
            <p className="text-gray-400 text-xs text-center mb-4">{t.heirloomDesc}</p>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded border border-gray-700">
                {player.inventory.map(item => {
                    const color = item.rarity === 'Legendary' ? 'border-orange-500' : item.rarity === 'Epic' ? 'border-blue-500' : item.rarity === 'Rare' ? 'border-green-500' : 'border-gray-600';
                    const isSelected = selectedHeirloomId === item.id;
                    return (
                        <div 
                            key={item.id}
                            onClick={() => setSelectedHeirloomId(item.id)}
                            className={`w-10 h-10 border-2 rounded cursor-pointer relative ${color} ${isSelected ? 'ring-2 ring-white bg-gray-700' : 'bg-gray-800'}`}
                        >
                             <div className="absolute inset-0 flex items-center justify-center text-[10px] text-center leading-none">
                                {item.name.substring(0, 2)}
                             </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Heirloom Details Panel */}
            {selectedHeirloomId && (
                (() => {
                    const item = player.inventory.find(i => i.id === selectedHeirloomId);
                    if (!item) return null;
                    const colorClass = item.rarity === 'Legendary' ? 'text-orange-500' : item.rarity === 'Epic' ? 'text-blue-400' : item.rarity === 'Rare' ? 'text-green-400' : 'text-gray-400';
                    return (
                        <div className="mt-4 p-3 bg-black/60 border border-gray-700 rounded text-xs animate-fade-in">
                            <div className={`font-bold text-sm mb-1 ${colorClass}`}>{item.name}</div>
                            <div className="text-gray-500 italic mb-2">{item.rarity}</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-gray-300">
                                {Object.entries(item.stats).map(([key, val]) => (
                                    <div key={key} className="flex justify-between">
                                        <span>{t[key as keyof typeof t] || key}:</span>
                                        <span className="text-white">
                                            {['CRIT_RATE','CRIT_DMG','DODGE'].includes(key) 
                                                ? `+${(val * 100).toFixed(1)}%` 
                                                : `+${val}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-gray-400 leading-relaxed border-t border-gray-700 pt-2">
                                {item.description}
                            </div>
                        </div>
                    );
                })()
            )}

            <button
                onClick={resetGame}
                disabled={!selectedHeirloomId && player.inventory.length > 0}
                className="mt-4 w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {t.restartWithHeirloom}
            </button>
        </div>
    );
  };

  const renderContent = () => {
    if (gameState === GameState.START) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-fade-in bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-teal-900/30"></div>
          <div className="relative z-10">
              <h1 className="text-5xl font-bold font-serif-sc text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-purple-600 drop-shadow-lg mb-4 filter contrast-125">
                {t.startTitle}
              </h1>
              <p className="text-gray-300 text-lg font-mono tracking-widest">{t.startDesc}</p>
          </div>
          <button
            onClick={startGame}
            className="relative z-10 px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-all transform hover:scale-105 animate-float flex items-center space-x-2"
          >
            <PlayIcon className="h-5 w-5"/> <span>{t.enterBtn}</span>
          </button>
        </div>
      );
    }

    if (gameState === GameState.INTRO) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-fade-in">
          <p className="text-lg leading-relaxed font-serif-sc text-gray-200">{storyText}</p>
          <button
            onClick={advanceToIntro2}
            className="px-6 py-2 border border-teal-500 text-teal-400 hover:bg-teal-500/10 rounded transition-colors"
          >
            {t.continueBtn}
          </button>
        </div>
      );
    }

    if (gameState === GameState.GAME_OVER || gameState === GameState.ENDING) {
      const isWin = gameState === GameState.ENDING;
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 animate-fade-in bg-black/50">
          <div className={`p-4 rounded-full border-4 ${isWin ? 'border-yellow-500 bg-yellow-900/20' : 'border-red-600 bg-red-900/20'} mb-4`}>
             {isWin ? <StarIcon className="h-16 w-16 text-yellow-500"/> : <XMarkIcon className="h-16 w-16 text-red-600"/>}
          </div>
          <h2 className={`text-4xl font-bold font-serif-sc ${isWin ? 'text-yellow-400' : 'text-red-500'}`}>
            {isWin ? endingData?.title : t.gameOver}
          </h2>
          <p className="text-gray-300 max-w-xs leading-relaxed">
            {isWin ? endingData?.content : t.gameOverDesc}
          </p>
          {renderHeirloomSelection()}
        </div>
      );
    }

    // MAIN GAME UI
    // Ensure numeric values for rendering stats to avoid TS concatenation/math issues
    const totalAtk = (Number(player.atk) || 10) + getExtraStat(player.inventory, StatType.ATK);
    const totalDef = (Number(player.def) || 5) + getExtraStat(player.inventory, StatType.DEF);
    const totalDodge = Number(player.dodge) + getExtraStat(player.inventory, StatType.DODGE);
    const totalCrit = Number(player.critRate) + getExtraStat(player.inventory, StatType.CRIT_RATE);
    const totalCritDmg = Number(player.critDmg) + getExtraStat(player.inventory, StatType.CRIT_DMG);
    const extraHp = getExtraStat(player.inventory, StatType.HP);
    const totalMaxHp = Number(player.maxHp) + extraHp;

    return (
      <div className="flex flex-col h-full relative">
        {/* TOP STATUS BAR */}
        <div className="flex-none p-3 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
             <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 border border-gray-600 overflow-hidden">
                <img src={`https://robohash.org/player${player.luck}?set=set5`} alt="Avatar" className="w-full h-full"/>
             </div>
             <div className="absolute -bottom-1 -right-1 bg-black text-[10px] border border-gray-600 rounded px-1 text-yellow-400">
               {t.level} {player.level}
             </div>
          </div>
          
          {/* Bars & Stats */}
          <div className="flex-1 space-y-2">
             {/* HP Bar */}
             <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (Number(player.currentHp) / Number(totalMaxHp)) * 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
                   {player.currentHp} / {totalMaxHp}
                </div>
             </div>
             {/* Exp Bar - Made thicker with text */}
             <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div 
                   className="absolute top-0 left-0 h-full bg-yellow-600"
                   style={{ width: `${Math.min(100, (Number(player.exp) / (Number(player.level) * 100)) * 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
                   EXP {player.exp} / {player.level * 100}
                </div>
             </div>
             
             {/* Stats Grid - Changed to 3 columns x 2 rows for better visibility */}
             <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-[10px] text-gray-400 mt-1 bg-black/20 p-2 rounded">
                <div className="flex justify-between px-2"><span className="text-gray-500">{t.atk}</span><span className="text-white font-mono">{totalAtk}</span></div>
                <div className="flex justify-between px-2"><span className="text-gray-500">{t.def}</span><span className="text-white font-mono">{totalDef}</span></div>
                <div className="flex justify-between px-2"><span className="text-gray-500">{t.luck}</span><span className="text-purple-300 font-mono">{player.luck}</span></div>
                
                <div className="flex justify-between px-2"><span className="text-gray-500">{t.critStat}</span><span className="text-yellow-200 font-mono">{(totalCrit*100).toFixed(0)}%</span></div>
                <div className="flex justify-between px-2"><span className="text-gray-500">{t.critDmg}</span><span className="text-red-200 font-mono">{(totalCritDmg * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between px-2"><span className="text-gray-500">{t.dodge}</span><span className="text-blue-200 font-mono">{(totalDodge*100).toFixed(0)}%</span></div>
             </div>
          </div>
        </div>

        {/* GAME WINDOW */}
        <div className={`flex-grow flex flex-col overflow-hidden relative transition-colors duration-100 ${combatAnim === 'playerHit' ? 'bg-red-900/20' : ''}`}>
            
            {/* Main Visual/Text Area */}
            <div className={`h-[65%] p-4 overflow-y-auto relative flex flex-col items-center justify-center space-y-4 ${combatAnim === 'playerHit' ? 'animate-shake-y' : ''}`}>
                 
                 {/* Monster/Boss Image */}
                 {gameState === GameState.COMBAT && currentEnemy && (
                     <div className="relative animate-float">
                        <img 
                            src={`https://robohash.org/${currentEnemy.name}?set=set2`} 
                            className={`w-32 h-32 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-transform duration-100 ${loading ? 'opacity-50 blur-sm' : ''} ${combatAnim === 'enemyHit' ? 'animate-shake-x grayscale-0 brightness-150 sepia-0 text-red-500' : ''}`}
                            alt="Enemy" 
                        />
                        {/* Enemy Health Bar */}
                        <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gray-800 rounded-full border border-gray-600 overflow-hidden">
                            <div className="h-full bg-red-600" style={{ width: `${(Number(currentEnemy.hp) / Number(currentEnemy.maxHp))*100}%` }}></div>
                        </div>
                     </div>
                 )}

                 {/* Text Container */}
                 <div className={`text-center space-y-2 max-w-sm ${loading ? 'animate-pulse opacity-50' : 'animate-fade-in'}`}>
                     {loading ? (
                         <div className="flex flex-col items-center space-y-2">
                            <ArrowPathIcon className="h-6 w-6 animate-spin text-teal-500"/>
                            <p className="text-teal-500 text-sm font-mono">{t.exploring}</p>
                         </div>
                     ) : (
                         <p className="text-sm md:text-base leading-relaxed font-serif-sc text-gray-200 drop-shadow-md bg-gray-900/60 p-4 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                             {storyText}
                         </p>
                     )}
                 </div>

                 {/* Choices */}
                 {!loading && currentChoices.length > 0 && (
                     <div className="w-full max-w-xs space-y-2 animate-fade-in z-20">
                         {currentChoices.map((choice, idx) => (
                             <button
                                 key={idx}
                                 onClick={() => {
                                     if (choice.actionId === 'dialogue_choice') handleDialogueChoice(choice);
                                     else handleEventChoice(choice);
                                 }}
                                 className="w-full py-3 px-4 bg-gray-800/80 hover:bg-teal-900/50 border border-gray-600 hover:border-teal-400 text-sm rounded transition-all text-left flex items-center justify-between group"
                             >
                                 <span className="group-hover:text-teal-300">{choice.text}</span>
                                 <CheckCircleIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 text-teal-400 transition-opacity"/>
                             </button>
                         ))}
                     </div>
                 )}

                 {/* Combat Buttons */}
                 {!loading && gameState === GameState.COMBAT && (
                      <div className="flex gap-4 w-full max-w-xs animate-fade-in z-20">
                          <button 
                              onClick={handleCombatAction} 
                              disabled={combatAnim !== 'idle'}
                              className={`flex-1 py-3 bg-red-900/80 border border-red-600 hover:bg-red-800 text-red-100 font-bold rounded flex items-center justify-center gap-2 transition-all ${combatAnim === 'playerAttack' ? 'animate-lunge' : ''}`}
                          >
                              <FireIcon className="h-5 w-5"/> {t.attack}
                          </button>
                          {!currentEnemy?.isFinalBoss && (
                            <button onClick={handleExplore} disabled={combatAnim !== 'idle'} className="flex-1 py-3 bg-gray-700/80 border border-gray-500 hover:bg-gray-600 text-gray-200 font-bold rounded transition-all">
                                {t.flee}
                            </button>
                          )}
                      </div>
                 )}
            </div>

            {/* Logs Area */}
            <div className="h-[35%] bg-black/40 border-t border-gray-800 p-2 overflow-y-auto font-mono text-xs text-gray-400 space-y-1 relative scrollbar-hide">
                <div className="absolute top-0 right-0 p-1 text-[10px] text-gray-600 select-none">LOGS</div>
                {logs.map(log => (
                    <div key={log.id} className={`border-l-2 pl-2 py-0.5 animate-fade-in ${
                        log.type === 'danger' ? 'border-red-500 text-red-300' : 
                        log.type === 'gain' ? 'border-yellow-500 text-yellow-100' :
                        log.type === 'combat' ? 'border-orange-500 text-gray-300' :
                        log.type === 'narrative' ? 'border-teal-500 text-teal-200 italic' :
                        'border-gray-600'
                    }`}>
                        {renderLogText(log.text)}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>

            {/* FLOATING CONTROLS (Z-40 to prevent hiding) */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-end px-6 pointer-events-none z-40">
                
                {/* Left: Boss Button */}
                <div className="pointer-events-auto mr-auto relative">
                     {player.bossLocated && gameState === GameState.EXPLORE && !currentEnemy && (
                         <button 
                            onClick={handleChallengeBoss}
                            className="w-12 h-12 rounded-full bg-red-900/90 border-2 border-red-500 text-red-100 shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center justify-center hover:scale-110 transition-transform"
                         >
                            <ExclamationTriangleIcon className="h-6 w-6"/>
                         </button>
                     )}
                </div>

                {/* Center: Explore Button */}
                <div className="pointer-events-auto -mb-2">
                     {gameState === GameState.EXPLORE && !currentEnemy && currentChoices?.length === 0 && (
                         <button 
                            onClick={handleExplore}
                            disabled={loading}
                            className="w-20 h-20 rounded-full bg-teal-600 border-4 border-teal-400/50 shadow-[0_0_30px_rgba(20,184,166,0.4)] flex items-center justify-center hover:bg-teal-500 hover:scale-105 active:scale-95 transition-all animate-float disabled:opacity-50 disabled:animate-none"
                         >
                            <MagnifyingGlassIcon className="h-10 w-10 text-white"/>
                         </button>
                     )}
                </div>

                {/* Right: Bag Button */}
                <div className="pointer-events-auto ml-auto relative">
                     <button 
                        onClick={() => setShowBag(true)}
                        className="w-12 h-12 rounded-full bg-gray-800/90 border border-gray-500 text-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-700 hover:text-white transition-colors"
                     >
                        <ArchiveBoxIcon className="h-6 w-6"/>
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-gray-900">
                           {player.inventory.length}
                        </span>
                     </button>
                </div>
            </div>
        </div>

        {/* INVENTORY MODAL */}
        {showBag && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 animate-fade-in">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                    <h2 className="text-xl font-serif-sc text-teal-400 flex items-center gap-2">
                        <ArchiveBoxIcon className="h-5 w-5"/> {t.bag} <span className="text-sm text-gray-500 font-mono">({player.inventory.length}/30)</span>
                    </h2>
                    <button onClick={() => setShowBag(false)} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                {/* Equipped Stats Summary */}
                <div className="mb-4 bg-gray-800/50 rounded p-2 text-xs border border-gray-700">
                     <div className="text-gray-500 mb-1">{t.bonusStats}</div>
                     <div className="grid grid-cols-4 gap-2">
                         <div className="text-red-300">ATK: +{getExtraStat(player.inventory, StatType.ATK)}</div>
                         <div className="text-blue-300">DEF: +{getExtraStat(player.inventory, StatType.DEF)}</div>
                         <div className="text-green-300">HP: +{getExtraStat(player.inventory, StatType.HP)}</div>
                         <div className="text-yellow-300">LUCK: +0</div>
                     </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-10 gap-2 mb-4">
                    {Array.from({ length: 30 }).map((_, i) => {
                        const item = player.inventory[i];
                        if (!item) return <div key={i} className="aspect-square bg-gray-800/50 rounded border border-gray-800"></div>;
                        
                        const color = item.rarity === 'Legendary' ? 'border-orange-500' : item.rarity === 'Epic' ? 'border-blue-500' : item.rarity === 'Rare' ? 'border-green-500' : 'border-gray-600';
                        const isSelected = selectedItemId === item.id;

                        return (
                            <button 
                                key={item.id} 
                                onClick={() => setSelectedItemId(item.id)}
                                className={`aspect-square relative rounded border-2 ${color} ${item.isEquipped ? 'bg-teal-900/30' : 'bg-gray-800'} ${isSelected ? 'ring-2 ring-white z-10' : ''} transition-all`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-center leading-none text-gray-300">
                                    {item.name.substring(0, 1)}
                                </div>
                                {item.isEquipped && <div className="absolute top-0 right-0 w-2 h-2 bg-teal-500 rounded-full"></div>}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Item Details Panel */}
                <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded p-3 relative">
                     {selectedItemId ? (
                         (() => {
                             const item = player.inventory.find(i => i.id === selectedItemId);
                             if (!item) return <div className="text-gray-500 text-center mt-10">{t.selectItem}</div>;
                             
                             const colorClass = item.rarity === 'Legendary' ? 'text-orange-500' : item.rarity === 'Epic' ? 'text-blue-400' : item.rarity === 'Rare' ? 'text-green-400' : 'text-gray-400';

                             return (
                                 <div className="animate-fade-in h-full flex flex-col relative">
                                     {/* Close Button */}
                                     <button 
                                        onClick={() => setSelectedItemId(null)}
                                        className="absolute -top-3 -right-3 p-2 bg-red-900 text-red-200 border border-red-700 rounded-full hover:bg-red-700 hover:text-white transition-colors z-20 shadow-lg"
                                        title="Close Details"
                                     >
                                        <XMarkIcon className="h-5 w-5"/>
                                     </button>

                                     <div className="flex justify-between items-start mb-2 pr-6">
                                         <div>
                                             <h3 className={`font-bold text-lg ${colorClass}`}>{item.name}</h3>
                                             <div className="text-xs text-gray-500 italic">{item.rarity}</div>
                                         </div>
                                         {item.isEquipped && <span className="px-2 py-0.5 bg-teal-900 text-teal-300 text-[10px] rounded border border-teal-700">EQUIPPED</span>}
                                     </div>
                                     
                                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 text-xs text-gray-300">
                                         {Object.entries(item.stats).map(([key, val]) => (
                                             <div key={key} className="flex justify-between border-b border-gray-700/50 pb-0.5">
                                                 <span>{t[key as keyof typeof t] || key}</span>
                                                 <span className="font-bold text-white">
                                                     {['CRIT_RATE','CRIT_DMG','DODGE'].includes(key) ? `+${(val * 100).toFixed(1)}%` : `+${val}`}
                                                 </span>
                                             </div>
                                         ))}
                                     </div>

                                     <p className="text-xs text-gray-400 leading-relaxed italic mb-auto border-l-2 border-gray-600 pl-2">
                                         "{item.description}"
                                     </p>

                                     <div className="grid grid-cols-2 gap-3 mt-4">
                                         {pendingLoot ? (
                                             <>
                                                 <button onClick={() => deleteItem(item.id)} className="col-span-2 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded flex items-center justify-center gap-2">
                                                     <ArrowPathIcon className="h-4 w-4"/> {t.confirmSwap}
                                                 </button>
                                                 <button onClick={() => { setPendingLoot(null); setShowBag(false); }} className="col-span-2 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded">
                                                     {t.cancelSwap}
                                                 </button>
                                             </>
                                         ) : (
                                             <>
                                                 <button onClick={() => toggleEquip(item)} className={`py-2 rounded font-bold transition-colors ${item.isEquipped ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-teal-700 text-white hover:bg-teal-600'}`}>
                                                     {item.isEquipped ? t.unequip : t.equip}
                                                 </button>
                                                 <button onClick={() => deleteItem(item.id)} className="py-2 bg-red-900/50 hover:bg-red-800 text-red-300 border border-red-800 rounded flex items-center justify-center gap-1">
                                                     <TrashIcon className="h-4 w-4"/> {t.delete}
                                                 </button>
                                             </>
                                         )}
                                     </div>
                                 </div>
                             );
                         })()
                     ) : (
                         <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                             <ArchiveBoxIcon className="h-12 w-12 mb-2"/>
                             <p className="text-xs">{t.selectItem}</p>
                         </div>
                     )}
                </div>

                {!selectedItemId && !pendingLoot && (
                    <button 
                       onClick={massEquip}
                       className="mt-4 w-full py-3 bg-gradient-to-r from-teal-700 to-teal-600 border border-teal-500 text-white font-bold rounded shadow-lg hover:from-teal-600 hover:to-teal-500 transition-all text-sm flex items-center justify-center gap-2"
                    >
                       <SparklesIcon className="h-4 w-4 text-yellow-300"/> {t.autoEquip}
                    </button>
                )}
            </div>
        )}

        {/* LOOT CONFLICT MODAL (Only if Bag Closed) */}
        {pendingLoot && !showBag && (
            <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-6 animate-fade-in">
                 <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 max-w-sm w-full shadow-2xl">
                     <div className="flex items-center gap-2 text-yellow-500 mb-4">
                         <ExclamationTriangleIcon className="h-6 w-6"/>
                         <h3 className="text-lg font-bold">{t.lootConflict}</h3>
                     </div>
                     <p className="text-gray-300 text-sm mb-4">{t.bagFullDesc}</p>
                     
                     {/* New Item Card */}
                     <div className="bg-black/40 rounded p-3 mb-6 border border-gray-700">
                         <div className={`font-bold ${pendingLoot.rarity === 'Legendary' ? 'text-orange-500' : pendingLoot.rarity === 'Epic' ? 'text-blue-400' : pendingLoot.rarity === 'Rare' ? 'text-green-400' : 'text-gray-400'}`}>
                             {pendingLoot.name}
                         </div>
                         <div className="text-xs text-gray-500 italic mb-2">{pendingLoot.rarity}</div>
                         <div className="text-xs text-gray-300 grid grid-cols-2 gap-2">
                             {Object.entries(pendingLoot.stats).map(([k,v]) => (
                                 <span key={k}>{k}: +{v}</span>
                             ))}
                         </div>
                     </div>

                     <div className="space-y-3">
                         <button onClick={() => setShowBag(true)} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded">
                             {t.swapItem}
                         </button>
                         <button onClick={() => setPendingLoot(null)} className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded">
                             {t.discardNew}
                         </button>
                     </div>
                 </div>
            </div>
        )}

      </div>
    );
  };

  return (
    <Layout language={language} setLanguage={setLanguage}>
        {renderContent()}
    </Layout>
  );
}