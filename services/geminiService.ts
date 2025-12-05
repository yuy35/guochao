// import { GoogleGenAI } from "@google/genai";
import { Player, Item, Enemy, StatType, Language } from "../types";

// Access API Key from environment variables
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- LOCAL DATA FOR INSTANT GENERATION ---

const ENEMIES_DB = {
  zh: {
    low: [ // Zones 1-2 (Ancient/Street)
      { name: "时间残渣", desc: "时间的灰尘聚集而成的低级魔物。" },
      { name: "历史幽灵", desc: "穿着旧时代衣服的模糊人影。" },
      { name: "青铜魔偶", desc: "被赋予了诡异生命的古老青铜器。" },
      { name: "皮影煞", desc: "从幕布中逃出的黑色剪影，锋利无比。" }
    ],
    mid: [ // Zones 3-4 (Industrial/Clockwork)
      { name: "发条斥候", desc: "不知疲倦的机械士兵，发出滴答声。" },
      { name: "失控秒针", desc: "锋利且快速移动的金属长条。" },
      { name: "时光盗贼", desc: "试图偷走你时间的蒙面人。" },
      { name: "蒸汽梦魇", desc: "喷射着高温蒸汽的扭曲机械。" }
    ],
    high: [ // Zones 5-6 (Void/Digital)
      { name: "虚空水母", desc: "在空气中游动的半透明生物，触碰会丢失记忆。" },
      { name: "错乱代码", desc: "仿佛现实世界的BUG，闪烁不定。" },
      { name: "熵增兽", desc: "一团混乱的黑色物质，所过之处万物腐朽。" },
      { name: "因果律者", desc: "能够短暂修改现实的恐怖存在。" }
    ]
  },
  en: {
    low: [
      { name: "Time Residue", desc: "A low-level monster formed from temporal dust." },
      { name: "History Ghost", desc: "A blurry figure in ancient attire." },
      { name: "Bronze Golem", desc: "Ancient bronze animated by chaos." },
      { name: "Shadow Puppet", desc: "A sharp silhouette escaped from the screen." }
    ],
    mid: [
      { name: "Clockwork Scout", desc: "A tireless mechanical soldier ticking ominously." },
      { name: "Rogue Second Hand", desc: "A sharp, fast-moving metal strip." },
      { name: "Time Bandit", desc: "A masked figure trying to steal your seconds." },
      { name: "Steam Nightmare", desc: "Twisted machinery venting scalding steam." }
    ],
    high: [
      { name: "Void Jellyfish", desc: "Floating translucent creatures that eat memories." },
      { name: "Glitch Code", desc: "A reality bug flickering in and out." },
      { name: "Entropy Beast", desc: "A mass of chaos that decays everything near it." },
      { name: "Causality Breaker", desc: "A horror that can briefly rewrite reality." }
    ]
  }
};

const ITEMS_DB = {
  zh: [
    { name: "兔儿爷泥塑", desc: "保佑平安的传统泥塑。" },
    { name: "景泰蓝手镯", desc: "工艺精湛的蓝色手镯。" },
    { name: "风筝线轴", desc: "极其坚韧的线，能割开空气。" },
    { name: "皮影刻刀", desc: "雕刻精美的锋利小刀。" },
    { name: "京剧脸谱", desc: "戴上后仿佛变了一个人。" },
    { name: "毛猴", desc: "蝉蜕和辛夷做成的小玩意，充满灵性。" },
    { name: "内画鼻烟壶", desc: "壶内藏有乾坤。" },
    { name: "中幡", desc: "沉重的大旗，增加力量。" },
    { name: "拨浪鼓", desc: "摇晃时能发出震慑灵魂的声音。" },
    { name: "剪纸护符", desc: "红色的剪纸，蕴含着辟邪的力量。" }
  ],
  en: [
    { name: "Rabbit God Clay", desc: "A clay figure granting protection." },
    { name: "Cloisonne Bangle", desc: "Exquisite blue craftsmanship." },
    { name: "Kite Spool", desc: "Razor sharp line cutting the air." },
    { name: "Shadow Carving Knife", desc: "A sharp tool for delicate work." },
    { name: "Opera Mask", desc: "Changes your persona instantly." },
    { name: "Hairy Monkey", desc: "A cicada shell craft with spirit." },
    { name: "Snuff Bottle", desc: "A tiny world painted inside." },
    { name: "Heavy Banner", desc: "A massive flag boosting strength." },
    { name: "Rattle Drum", desc: "Shakes the soul when played." },
    { name: "Paper Cut Talisman", desc: "Red paper holding warding power." }
  ]
};

const BOSS_QUOTES_DB = {
  zh: [
    { text: "时间... 只是一个... 巨大的谎言...", choiceTruth: "你看见了什么？", choiceIgnorance: "闭嘴吧废物！" }, // Zone 1
    { text: "机械... 也会生锈... 你的身体... 也一样...", choiceTruth: "锈迹之下是什么？", choiceIgnorance: "我要拆了你！" }, // Zone 2
    { text: "我看到了... 结局... 一片虚无...", choiceTruth: "结局可以改变吗？", choiceIgnorance: "那你就去死吧！" }, // Zone 3
    { text: "数据... 溢出... 错误... 严重错误...", choiceTruth: "修复这个世界！", choiceIgnorance: "格式化完成。" }, // Zone 4
    { text: "因果... 已经断裂... 你回不去的...", choiceTruth: "我会找到路。", choiceIgnorance: "没有什么能阻挡我！" }, // Zone 5
    { text: "我是... 时间的... 守护者... 还是... 囚徒...", choiceTruth: "我们都是囚徒。", choiceIgnorance: "你是我的垫脚石。" }  // Zone 6
  ],
  en: [
    { text: "Time... is just... a massive lie...", choiceTruth: "What did you see?", choiceIgnorance: "Shut up, scum!" },
    { text: "Machines... rust... so will... you...", choiceTruth: "What lies beneath the rust?", choiceIgnorance: "I'll scrap you!" },
    { text: "I saw... the end... total void...", choiceTruth: "Can the end be changed?", choiceIgnorance: "Then perish!" },
    { text: "Data... overflow... error... critical...", choiceTruth: "Fix this world!", choiceIgnorance: "Format complete." },
    { text: "Causality... broken... no return...", choiceTruth: "I will find a way.", choiceIgnorance: "Nothing stops me!" },
    { text: "Am I... the guardian... or... the prisoner...", choiceTruth: "We are all prisoners.", choiceIgnorance: "You are just a stepping stone." }
  ]
}

const EVENTS_DB = {
  zh: {
    // Zone 1: Folklore / Street
    zone1: [
      { text: "你在路边发现了一个破旧的茶馆，里面空无一人。", choices: [{ text: "休息喝茶", outcome: "你喝了一杯温茶，感觉精神好多了。", hp: 30, exp: 0, stat: "NONE", val: 0, relic: false }, { text: "翻找柜台", outcome: "你在柜台下找到了一些钱币(经验)。", hp: 0, exp: 50, stat: "NONE", val: 0, relic: false }]},
      { text: "一个卖糖葫芦的老人正对着空气叫卖。", choices: [{ text: "买一串", outcome: "甜味让你想起了童年，心情平复。", hp: 20, exp: 10, stat: "NONE", val: 0, relic: false }, { text: "询问情报", outcome: "老人神神叨叨地指了一个方向。", hp: 0, exp: 30, stat: "NONE", val: 0, relic: false }]},
      { text: "路边停着一辆破旧的黄包车，车夫不见踪影。", choices: [{ text: "坐上去休息", outcome: "你感觉腿脚放松了一些。", hp: 15, exp: 0, stat: "DODGE", val: 0.01, relic: false }, { text: "拆下车铃", outcome: "这也许是个有用的零件。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: true }]},
      { text: "你听到远处传来京剧的唱腔，婉转凄切。", choices: [{ text: "驻足聆听", outcome: "你的灵魂受到了洗礼，暴击率提升。", hp: 0, exp: 20, stat: "CRIT_RATE", val: 0.02, relic: false }, { text: "快步离开", outcome: "这种环境让你感到不安。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: false }]},
      { text: "一群孩子在玩踢键子，但他们的脸是模糊的。", choices: [{ text: "加入他们", outcome: "你的身法变得更加灵活。", hp: 0, exp: 20, stat: "DODGE", val: 0.02, relic: false }, { text: "驱散幻影", outcome: "孩子们消散了，留下一地鸡毛。", hp: 0, exp: 30, stat: "NONE", val: 0, relic: false }]},
      { text: "一个捏面人的手艺人正在揉捏一团发光的面团。", choices: [{ text: "观察技法", outcome: "你学到了一些精细的操作技巧。", hp: 0, exp: 20, stat: "CRIT_DMG", val: 0.05, relic: false }, { text: "索要面人", outcome: "他送了你一个奇怪的面人。", hp: 0, exp: 0, stat: "NONE", val: 0, relic: true }]},
      { text: "墙角贴着一张发黄的寻人启事，照片上的人很眼熟。", choices: [{ text: "撕下查看", outcome: "照片上竟然是你自己！你感到一阵恶寒。", hp: -10, exp: 50, stat: "NONE", val: 0, relic: false }, { text: "无视", outcome: "不要好奇，好奇害死猫。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: false }]},
      { text: "一个神秘的货郎拦住了你的去路。", choices: [{ text: "查看货物", outcome: "你发现了一件被遗落的宝物。", hp: 0, exp: 0, stat: "NONE", val: 0, relic: true }, { text: "无视离开", outcome: "你错过了机会，但也很安全。", hp: 5, exp: 5, stat: "NONE", val: 0, relic: false }]},
      { text: "你发现了一座古老的关帝庙。", choices: [{ text: "进去参拜", outcome: "你感到一股正气护体。", hp: 0, exp: 0, stat: "DEF", val: 2, relic: false }, { text: "在庙外休息", outcome: "安全的避风港。", hp: 20, exp: 0, stat: "NONE", val: 0, relic: false }]},
      { text: "天空下起了红色的纸雨。", choices: [{ text: "收集纸片", outcome: "这些纸片上写满了奇怪的符文。", hp: 0, exp: 40, stat: "NONE", val: 0, relic: false }, { text: "躲避", outcome: "你躲过了这场诡异的雨。", hp: 10, exp: 10, stat: "NONE", val: 0, relic: false }]}
    ],
    // Zone 2: Ancient / Bronze
    zone2: [
      { text: "你误入了一个古战场，四周散落着断裂的兵器。", choices: [{ text: "寻找兵器", outcome: "你找到了一把锋利的青铜剑残片。", hp: 0, exp: 20, stat: "ATK", val: 3, relic: false }, { text: "缅怀逝者", outcome: "你感到一种悲壮的力量。", hp: 0, exp: 30, stat: "DEF", val: 2, relic: false }]},
      { text: "巨大的青铜鼎挡在路中央，里面煮着沸腾的液体。", choices: [{ text: "喝一口", outcome: "味道极苦，但你的力量增强了。", hp: -20, exp: 0, stat: "ATK", val: 5, relic: false }, { text: "绕开", outcome: "明哲保身。", hp: 10, exp: 10, stat: "NONE", val: 0, relic: false }]},
      { text: "一个祭祀坑，里面堆满了甲骨。", choices: [{ text: "解读甲骨", outcome: "你理解了古代的占卜之术。", hp: 0, exp: 40, stat: "CRIT_RATE", val: 0.03, relic: false }, { text: "捡起一块", outcome: "这也许是个文物。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: true }]},
      { text: "编钟的声音在空气中回荡，没有演奏者。", choices: [{ text: "敲击编钟", outcome: "声波震荡，你的防御力提升。", hp: 0, exp: 20, stat: "DEF", val: 3, relic: false }, { text: "捂住耳朵", outcome: "声音太大了，你感到头晕。", hp: -10, exp: 10, stat: "NONE", val: 0, relic: false }]},
      { text: "一个穿着战袍的骷髅指着前方。", choices: [{ text: "顺着指引", outcome: "你发现了一个隐蔽的补给点。", hp: 40, exp: 10, stat: "NONE", val: 0, relic: false }, { text: "攻击骷髅", outcome: "骷髅散架了，掉落了装备。", hp: 0, exp: 20, stat: "NONE", val: 0, relic: true }]},
      { text: "地上画着复杂的八卦阵图。", choices: [{ text: "踏入阵中", outcome: "阵法启动，你的闪避率大幅提升。", hp: 0, exp: 30, stat: "DODGE", val: 0.04, relic: false }, { text: "破坏阵眼", outcome: "阵法失效，释放出一些能量。", hp: -10, exp: 50, stat: "NONE", val: 0, relic: false }]},
      { text: "你看到两个古代谋士在下棋，棋子是人骨。", choices: [{ text: "观棋不语", outcome: "你领悟了战术。", hp: 0, exp: 40, stat: "CRIT_DMG", val: 0.08, relic: false }, { text: "打乱棋盘", outcome: "谋士愤怒地消失了。", hp: -10, exp: 20, stat: "NONE", val: 0, relic: false }]},
      { text: "一辆着火的战车向你冲来。", choices: [{ text: "正面拦截", outcome: "你受了伤，但锻炼了体魄。", hp: -30, exp: 50, stat: "DEF", val: 4, relic: false }, { text: "闪避", outcome: "好险！", hp: 0, exp: 10, stat: "DODGE", val: 0.02, relic: false }]},
      { text: "你发现了一座古老的烽火台。", choices: [{ text: "点燃烽火", outcome: "狼烟四起，你感到热血沸腾。", hp: 0, exp: 30, stat: "ATK", val: 3, relic: false }, { text: "休息", outcome: "高处风景不错。", hp: 20, exp: 10, stat: "NONE", val: 0, relic: false }]},
      { text: "一个青铜面具漂浮在空中。", choices: [{ text: "戴上面具", outcome: "你获得了面具的力量，但也付出了代价。", hp: -20, exp: 0, stat: "CRIT_RATE", val: 0.05, relic: false }, { text: "收起面具", outcome: "这绝对是个好东西。", hp: 0, exp: 0, stat: "NONE", val: 0, relic: true }]}
    ],
    // Zone 3: Industrial / Steam
    zone3: [
        { text: "巨大的蒸汽齿轮在头顶轰鸣，黑色的煤烟遮蔽了天空。", choices: [{ text: "收集煤炭", outcome: "你弄得满身是灰，但找到了一些耐用的材料。", hp: 0, exp: 30, stat: "DEF", val: 2, relic: false }, { text: "攀爬齿轮", outcome: "危险但刺激的锻炼。", hp: -5, exp: 40, stat: "DODGE", val: 0.01, relic: false }]},
        { text: "一辆幽灵火车呼啸而过，掉落了一个箱子。", choices: [{ text: "打开箱子", outcome: "里面是一些旧时代的补给。", hp: 30, exp: 0, stat: "NONE", val: 0, relic: false }, { text: "撬开夹层", outcome: "你发现了藏在里面的文物。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: true }]},
        { text: "蒸汽管道爆裂，滚烫的气体喷涌而出。", choices: [{ text: "强行通过", outcome: "皮肤被烫伤，但你变得更坚韧。", hp: -20, exp: 20, stat: "DEF", val: 4, relic: false }, { text: "寻找阀门", outcome: "你成功关闭了阀门，学到了机械知识。", hp: 0, exp: 40, stat: "CRIT_RATE", val: 0.02, relic: false }]},
        { text: "一个生锈的机械臂挡住了去路。", choices: [{ text: "拆解它", outcome: "你获得了一些零件和经验。", hp: 0, exp: 50, stat: "ATK", val: 2, relic: false }, { text: "绕路", outcome: "安全第一。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: false }]},
        { text: "工厂的广播里播放着断断续续的噪音。", choices: [{ text: "仔细分辨", outcome: "噪音中似乎隐藏着某种频率，你的精神更加集中。", hp: 0, exp: 30, stat: "CRIT_DMG", val: 0.05, relic: false }, { text: "破坏喇叭", outcome: "世界清静了。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: false }]},
        { text: "你发现了一张精密的设计图纸。", choices: [{ text: "研读图纸", outcome: "你对弱点的洞察力提升了。", hp: 0, exp: 40, stat: "CRIT_RATE", val: 0.03, relic: false }, { text: "带走图纸", outcome: "这可能很值钱。", hp: 0, exp: 20, stat: "NONE", val: 0, relic: true }]},
        { text: "地面布满了锋利的金属废料。", choices: [{ text: "小心通过", outcome: "你的步伐变得更加轻盈。", hp: 0, exp: 20, stat: "DODGE", val: 0.02, relic: false }, { text: "清理废料", outcome: "你被划伤了，但清理出了一条路。", hp: -10, exp: 40, stat: "NONE", val: 0, relic: false }]},
        { text: "一个熔炉正散发着惊人的热量。", choices: [{ text: "借火淬炼", outcome: "你的武器变得更加锋利。", hp: 0, exp: 0, stat: "ATK", val: 4, relic: false }, { text: "取暖", outcome: "真暖和。", hp: 10, exp: 0, stat: "NONE", val: 0, relic: false }]},
        { text: "一群发条老鼠在啃食电缆。", choices: [{ text: "驱赶它们", outcome: "它们逃跑时留下了一些亮晶晶的东西。", hp: 0, exp: 30, stat: "NONE", val: 0, relic: true }, { text: "捕捉一只", outcome: "它咬了你一口。", hp: -5, exp: 10, stat: "NONE", val: 0, relic: false }]},
        { text: "空气中弥漫着机油的味道。", choices: [{ text: "深呼吸", outcome: "呛死人了！生命值减少。", hp: -5, exp: 0, stat: "NONE", val: 0, relic: false }, { text: "戴上面罩", outcome: "你捡到了一个防毒面具（虽然不能用）。", hp: 0, exp: 10, stat: "DEF", val: 1, relic: false }]}
    ],
    // Zone 4: Clockwork / Time
    zone4: [
        { text: "巨大的钟摆在你面前来回摆动，像是一把断头台。", choices: [{ text: "抓住时机冲过去", outcome: "你的反应速度提升了。", hp: 0, exp: 30, stat: "DODGE", val: 0.03, relic: false }, { text: "等待停摆", outcome: "你等了很久，浪费了生命。", hp: -10, exp: 10, stat: "NONE", val: 0, relic: false }]},
        { text: "你看到未来的自己一闪而过。", choices: [{ text: "追上去", outcome: "你没追上，但捡到了他掉落的东西。", hp: 0, exp: 20, stat: "NONE", val: 0, relic: true }, { text: "原地思考", outcome: "你陷入了哲学思考，精神力提升。", hp: 0, exp: 40, stat: "CRIT_DMG", val: 0.05, relic: false }]},
        { text: "地上的时钟都在逆时针转动。", choices: [{ text: "强行拨正", outcome: "时钟爆炸了，你受了伤。", hp: -20, exp: 20, stat: "ATK", val: 3, relic: false }, { text: "顺应时间", outcome: "你感觉身体变年轻了一点（恢复生命）。", hp: 40, exp: 0, stat: "NONE", val: 0, relic: false }]},
        { text: "空气中漂浮着数字光尘。", choices: [{ text: "触碰光尘", outcome: "大量信息涌入脑海。", hp: -5, exp: 80, stat: "NONE", val: 0, relic: false }, { text: "收集起来", outcome: "这可以作为某种能量源。", hp: 0, exp: 20, stat: "NONE", val: 0, relic: true }]},
        { text: "一个没有指针的表盘。", choices: [{ text: "画上指针", outcome: "你重新定义了时间。", hp: 0, exp: 50, stat: "LUCK", val: 1, relic: false }, { text: "砸碎它", outcome: "打破束缚！攻击力提升。", hp: 0, exp: 20, stat: "ATK", val: 3, relic: false }]},
        { text: "时间在这里变得极其缓慢。", choices: [{ text: "练习挥拳", outcome: "在慢动作中你能看清每一个破绽。", hp: 0, exp: 30, stat: "CRIT_RATE", val: 0.04, relic: false }, { text: "睡觉", outcome: "睡一觉等于过了一年，恢复了所有体力。", hp: 100, exp: 0, stat: "NONE", val: 0, relic: false }]},
        { text: "你遇到了年轻时的boss。", choices: [{ text: "偷袭他", outcome: "你改变了历史线，获得了优势。", hp: 0, exp: 50, stat: "ATK", val: 5, relic: false }, { text: "观察他", outcome: "你了解了他的弱点。", hp: 0, exp: 40, stat: "DEF", val: 3, relic: false }]},
        { text: "一个沙漏正在倒流。", choices: [{ text: "打破沙漏", outcome: "时间乱流爆发。", hp: -30, exp: 100, stat: "NONE", val: 0, relic: false }, { text: "带走沙漏", outcome: "神秘的宝物。", hp: 0, exp: 0, stat: "NONE", val: 0, relic: true }]},
        { text: "四周回荡着滴答声，越来越快。", choices: [{ text: "保持冷静", outcome: "你的心境得到了锻炼。", hp: 0, exp: 30, stat: "DEF", val: 3, relic: false }, { text: "跟着节奏跑", outcome: "你的速度提升了。", hp: 0, exp: 20, stat: "DODGE", val: 0.02, relic: false }]},
        { text: "一扇写着'昨天'的门。", choices: [{ text: "推门而入", outcome: "你回到了过去，但这只是幻象。", hp: -10, exp: 30, stat: "NONE", val: 0, relic: false }, { text: "封死它", outcome: "往事不可追。", hp: 0, exp: 20, stat: "NONE", val: 0, relic: false }]}
    ],
    // Zone 5: Void / Digital
    zone5: [
        { text: "世界变成了像素块。", choices: [{ text: "攻击像素点", outcome: "你击碎了空气墙，发现隐藏道具。", hp: 0, exp: 20, stat: "NONE", val: 0, relic: true }, { text: "适应环境", outcome: "你学会了在数据流中生存。", hp: 0, exp: 40, stat: "DODGE", val: 0.03, relic: false }]},
        { text: "你的身体开始闪烁。", choices: [{ text: "稳定数据", outcome: "你消耗体力维持存在。", hp: -20, exp: 50, stat: "DEF", val: 5, relic: false }, { text: "任其闪烁", outcome: "你变得难以被捕捉（闪避提升）。", hp: 0, exp: 0, stat: "DODGE", val: 0.05, relic: false }]},
        { text: "眼前出现了一行代码。", choices: [{ text: "修改代码", outcome: "你修改了自己的属性！", hp: 0, exp: 0, stat: "ATK", val: 10, relic: false }, { text: "删除代码", outcome: "某个敌人消失了。", hp: 0, exp: 100, stat: "NONE", val: 0, relic: false }]},
        { text: "虚空中漂浮着霓虹灯牌。", choices: [{ text: "拆下灯管", outcome: "可以用作武器。", hp: 0, exp: 20, stat: "ATK", val: 3, relic: false }, { text: "阅读文字", outcome: "上面写着'不要回头'。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: false }]},
        { text: "你听到了电子合成的哭声。", choices: [{ text: "寻找声源", outcome: "你找到了一个被遗弃的AI核心。", hp: 0, exp: 30, stat: "NONE", val: 0, relic: true }, { text: "远离", outcome: "电子病毒很危险。", hp: 0, exp: 10, stat: "NONE", val: 0, relic: false }]},
        { text: "重力在这里失效了。", choices: [{ text: "利用失重跳跃", outcome: "你到达了平时去不了的高处。", hp: 0, exp: 40, stat: "CRIT_RATE", val: 0.04, relic: false }, { text: "抓住扶手", outcome: "安全着陆。", hp: 10, exp: 10, stat: "NONE", val: 0, relic: false }]},
        { text: "一堵防火墙挡在前面。", choices: [{ text: "暴力破解", outcome: "你受到了反噬，但突破了。", hp: -30, exp: 80, stat: "ATK", val: 5, relic: false }, { text: "寻找漏洞", outcome: "你找到了后门。", hp: 0, exp: 40, stat: "LUCK", val: 1, relic: false }]},
        { text: "数据洪流冲刷着你的意识。", choices: [{ text: "抵抗", outcome: "你的意志更加坚定。", hp: 0, exp: 50, stat: "DEF", val: 4, relic: false }, { text: "顺流而下", outcome: "你被冲到了未知的地方。", hp: -10, exp: 30, stat: "DODGE", val: 0.02, relic: false }]},
        { text: "你看到了自己的存档点。", choices: [{ text: "试图读取", "outcome": "文件损坏，但你获得了一些记忆碎片。", hp: 0, exp: 60, "stat": "CRIT_DMG", val: 0.1, relic: false }, { text: "覆盖存档", "outcome": "你决心已定。", hp: 20, exp: 20, stat: "NONE", val: 0, relic: false }]},
        { text: "一个巨大的光标在追逐你。", choices: [{ text: "反击", "outcome": "你击碎了光标。", hp: 0, exp: 50, stat: "ATK", val: 4, relic: false }, { text: "躲进回收站", "outcome": "里面有很多垃圾，但也有些好东西。", hp: 0, exp: 20, stat: "NONE", val: 0, relic: true }]}
      ],
      "zone6": [
        { text: "现实开始崩塌，地面变成了天空。", choices: [{ text: "倒立行走", outcome: "你适应了混乱。", hp: 0, exp: 50, stat: "DODGE", val: 0.05, relic: false }, { text: "闭上眼睛", outcome: "眼不见为净。", hp: 10, exp: 20, stat: "NONE", val: 0, relic: false }]},
        { text: "你遇到了另一个你自己，他已经疯了。", choices: [{ text: "杀了他", outcome: "你战胜了心魔。", hp: -40, exp: 200, stat: "ATK", val: 10, relic: false }, { text: "拥抱他", outcome: "你们融合了，力量倍增。", hp: 0, exp: 100, stat: "MAXHP", val: 50, relic: false }]},
        { text: "时间不再流动，一切都静止了。", choices: [{ text: "打破静止", outcome: "你用力一击，世界恢复运转。", hp: 0, exp: 60, stat: "ATK", val: 5, relic: false }, { text: "享受宁静", outcome: "难得的休息。", hp: 50, exp: 0, stat: "NONE", val: 0, relic: false }]},
        { text: "虚无正在吞噬周围的一切。", choices: [{ text: "凝视虚无", outcome: "当你凝视深渊时，深渊也在凝视你。", hp: -20, exp: 100, stat: "CRIT_DMG", val: 0.2, relic: false }, { text: "背对虚无", outcome: "不要回头！", hp: 0, exp: 30, stat: "DODGE", val: 0.03, relic: false }]},
        { text: "因果律武器的残骸。", choices: [{ text: "尝试修复", outcome: "你修好了一部分，获得了强大的力量。", hp: 0, exp: 0, stat: "ATK", val: 15, relic: true }, { text: "拆解", outcome: "获得了顶级材料。", hp: 0, exp: 80, stat: "DEF", val: 5, relic: false }]},
        { text: "无数条时间线纠缠在一起。", choices: [{ text: "斩断纠缠", outcome: "你的攻击可以切断命运。", hp: 0, exp: 100, stat: "CRIT_RATE", val: 0.05, relic: false }, { text: "梳理", outcome: "你理清了思绪。", hp: 20, exp: 40, stat: "NONE", val: 0, relic: false }]},
        { text: "存在的意义开始模糊。", choices: [{ text: "大声呐喊", "outcome": "证明自己存在！", hp: 0, exp: 50, stat: "ATK", val: 5, relic: false }, { text: "铭刻名字", "outcome": "你在虚空中留下了印记。", hp: 0, exp: 50, stat: "DEF", val: 5, relic: false }]},
        { text: "所有的物理法则都失效了。", choices: [{ text: "重塑法则", "outcome": "你就是这里的神。", hp: -50, exp: 300, stat: "LUCK", val: 2, relic: false }, { text: "随波逐流", "outcome": "也是一种生存之道。", hp: 0, exp: 20, stat: "DODGE", val: 0.05, relic: false }]},
        { text: "终焉的钟声响起。", choices: [{ text: "堵住钟口", "outcome": "你阻止了终结。", hp: 0, exp: 100, stat: "DEF", val: 8, relic: false }, { text: "聆听", "outcome": "这是最后的挽歌。", hp: -30, exp: 0, stat: "NONE", val: 0, relic: true }]},
        { text: "绝对的黑暗。", choices: [{ text: "点亮心火", "outcome": "心中的火焰照亮了前路。", hp: 0, exp: 100, stat: "CRIT_RATE", val: 0.1, relic: false }, { text: "融入黑暗", "outcome": "你成为了黑暗的一部分（潜行）。", hp: 0, exp: 50, stat: "DODGE", val: 0.1, relic: false }]}
      ]
    },
    en: {
      "zone1": [
        { "text": "You find a dilapidated tea house by the roadside, empty.", "choices": [{ "text": "Rest", "outcome": "You drank warm tea, feeling better.", "hp": 30, "exp": 0, "stat": "NONE", "val": 0, "relic": false }, { "text": "Search", "outcome": "Found coins under counter.", "hp": 0, "exp": 50, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "An old man selling Tanghulu.", "choices": [{ "text": "Buy", "outcome": "Sweet taste recalls memories.", "hp": 20, "exp": 10, "stat": "NONE", "val": 0, "relic": false }, { "text": "Ask info", "outcome": "He points mysteriously.", "hp": 0, "exp": 30, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Old rickshaw, puller missing.", "choices": [{ "text": "Sit", "outcome": "Legs relaxed.", "hp": 15, "exp": 0, "stat": "DODGE", "val": 0.01, "relic": false }, { "text": "Take bell", "outcome": "Useful part.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Peking Opera singing from afar.", "choices": [{ "text": "Listen", "outcome": "Soul cleansed, crit up.", "hp": 0, "exp": 20, "stat": "CRIT_RATE", "val": 0.02, "relic": false }, { "text": "Leave", "outcome": "Uneasy feeling.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Children playing with blurry faces.", "choices": [{ "text": "Join", "outcome": "Movement agile.", "hp": 0, "exp": 20, "stat": "DODGE", "val": 0.02, "relic": false }, { "text": "Dispel", "outcome": "They vanish.", "hp": 0, "exp": 30, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Dough figurine maker.", "choices": [{ "text": "Observe", "outcome": "Learned technique.", "hp": 0, "exp": 20, "stat": "CRIT_DMG", "val": 0.05, "relic": false }, { "text": "Ask", "outcome": "Got a figurine.", "hp": 0, "exp": 0, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Missing person poster looks like you.", "choices": [{ "text": "Check", "outcome": "It is you! Chill runs down spine.", "hp": -10, "exp": 50, "stat": "NONE", "val": 0, "relic": false }, { "text": "Ignore", "outcome": "Curiosity kills.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Mysterious peddler.", "choices": [{ "text": "Check", "outcome": "Found treasure.", "hp": 0, "exp": 0, "stat": "NONE", "val": 0, "relic": true }, { "text": "Leave", "outcome": "Safe.", "hp": 5, "exp": 5, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Ancient Temple.", "choices": [{ "text": "Worship", "outcome": "Protected by energy.", "hp": 0, "exp": 0, "stat": "DEF", "val": 2, "relic": false }, { "text": "Rest", "outcome": "Safe haven.", "hp": 20, "exp": 0, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Red paper rain.", "choices": [{ "text": "Collect", "outcome": "Strange runes.", "hp": 0, "exp": 40, "stat": "NONE", "val": 0, "relic": false }, { "text": "Dodge", "outcome": "Avoided rain.", "hp": 10, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]}
      ],
      "zone2": [
        { "text": "Ancient battlefield.", "choices": [{ "text": "Search", "outcome": "Found sword fragment.", "hp": 0, "exp": 20, "stat": "ATK", "val": 3, "relic": false }, { "text": "Mourn", "outcome": "Tragic strength.", "hp": 0, "exp": 30, "stat": "DEF", "val": 2, "relic": false }]},
        { "text": "Giant cauldron boiling.", "choices": [{ "text": "Drink", "outcome": "Bitter, strength up.", "hp": -20, "exp": 0, "stat": "ATK", "val": 5, "relic": false }, { "text": "Bypass", "outcome": "Safety.", "hp": 10, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Oracle bones pit.", "choices": [{ "text": "Read", "outcome": "Understood divination.", "hp": 0, "exp": 40, "stat": "CRIT_RATE", "val": 0.03, "relic": false }, { "text": "Take", "outcome": "Artifact.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Echoing bells.", "choices": [{ "text": "Strike", "outcome": "Defense up.", "hp": 0, "exp": 20, "stat": "DEF", "val": 3, "relic": false }, { "text": "Cover ears", "outcome": "Too loud.", "hp": -10, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Skeleton pointing.", "choices": [{ "text": "Follow", "outcome": "Hidden supplies.", "hp": 40, "exp": 10, "stat": "NONE", "val": 0, "relic": false }, { "text": "Attack", "outcome": "Dropped equipment.", "hp": 0, "exp": 20, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Bagua formation.", "choices": [{ "text": "Enter", "outcome": "Dodge up.", "hp": 0, "exp": 30, "stat": "DODGE", "val": 0.04, "relic": false }, { "text": "Destroy", "outcome": "Energy release.", "hp": -10, "exp": 50, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Strategists playing Go.", "choices": [{ "text": "Watch", "outcome": "Learned tactics.", "hp": 0, "exp": 40, "stat": "CRIT_DMG", "val": 0.08, "relic": false }, { "text": "Mess up", "outcome": "They vanish.", "hp": -10, "exp": 20, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Burning chariot.", "choices": [{ "text": "Intercept", "outcome": "Tougher body.", "hp": -30, "exp": 50, "stat": "DEF", "val": 4, "relic": false }, { "text": "Dodge", "outcome": "Close call.", "hp": 0, "exp": 10, "stat": "DODGE", "val": 0.02, "relic": false }]},
        { "text": "Beacon tower.", "choices": [{ "text": "Light", "outcome": "Blood boils.", "hp": 0, "exp": 30, "stat": "ATK", "val": 3, "relic": false }, { "text": "Rest", "outcome": "Nice view.", "hp": 20, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Floating mask.", "choices": [{ "text": "Wear", "outcome": "Power at cost.", "hp": -20, "exp": 0, "stat": "CRIT_RATE", "val": 0.05, "relic": false }, { "text": "Keep", "outcome": "Good item.", "hp": 0, "exp": 0, "stat": "NONE", "val": 0, "relic": true }]}
      ],
      "zone3": [
        { "text": "Steam gears roaring.", "choices": [{ "text": "Collect coal", "outcome": "Found materials.", "hp": 0, "exp": 30, "stat": "DEF", "val": 2, "relic": false }, { "text": "Climb", "outcome": "Agility training.", "hp": -5, "exp": 40, "stat": "DODGE", "val": 0.01, "relic": false }]},
        { "text": "Ghost train crate.", "choices": [{ "text": "Open", "outcome": "Supplies.", "hp": 30, "exp": 0, "stat": "NONE", "val": 0, "relic": false }, { "text": "Pry", "outcome": "Artifact.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Steam pipe burst.", "choices": [{ "text": "Force", "outcome": "Tougher.", "hp": -20, "exp": 20, "stat": "DEF", "val": 4, "relic": false }, { "text": "Valve", "outcome": "Mechanics learned.", "hp": 0, "exp": 40, "stat": "CRIT_RATE", "val": 0.02, "relic": false }]},
        { "text": "Rusty arm.", "choices": [{ "text": "Dismantle", "outcome": "Parts.", "hp": 0, "exp": 50, "stat": "ATK", "val": 2, "relic": false }, { "text": "Detour", "outcome": "Safe.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Factory noise.", "choices": [{ "text": "Listen", "outcome": "Focus.", "hp": 0, "exp": 30, "stat": "CRIT_DMG", "val": 0.05, "relic": false }, { "text": "Destroy", "outcome": "Quiet.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Blueprint.", "choices": [{ "text": "Study", "outcome": "Insight.", "hp": 0, "exp": 40, "stat": "CRIT_RATE", "val": 0.03, "relic": false }, { "text": "Take", "outcome": "Valuable.", "hp": 0, "exp": 20, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Metal scraps.", "choices": [{ "text": "Walk", "outcome": "Light steps.", "hp": 0, "exp": 20, "stat": "DODGE", "val": 0.02, "relic": false }, { "text": "Clear", "outcome": "Cleared path.", "hp": -10, "exp": 40, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Furnace.", "choices": [{ "text": "Temper", "outcome": "Sharper weapon.", "hp": 0, "exp": 0, "stat": "ATK", "val": 4, "relic": false }, { "text": "Warm", "outcome": "Warm.", "hp": 10, "exp": 0, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Clockwork mice.", "choices": [{ "text": "Shoo", "outcome": "Left item.", "hp": 0, "exp": 30, "stat": "NONE", "val": 0, "relic": true }, { "text": "Catch", "outcome": "Bitten.", "hp": -5, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Oil smell.", "choices": [{ "text": "Breathe", "outcome": "Choking.", "hp": -5, "exp": 0, "stat": "NONE", "val": 0, "relic": false }, { "text": "Mask", "outcome": "Found mask.", "hp": 0, "exp": 10, "stat": "DEF", "val": 1, "relic": false }]}
      ],
      "zone4": [
        { "text": "Pendulum.", "choices": [{ "text": "Rush", "outcome": "Reaction up.", "hp": 0, "exp": 30, "stat": "DODGE", "val": 0.03, "relic": false }, { "text": "Wait", "outcome": "Wasted time.", "hp": -10, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Future self.", "choices": [{ "text": "Chase", "outcome": "Dropped item.", "hp": 0, "exp": 20, "stat": "NONE", "val": 0, "relic": true }, { "text": "Ponder", "outcome": "Mental power.", "hp": 0, "exp": 40, "stat": "CRIT_DMG", "val": 0.05, "relic": false }]},
        { "text": "Reverse clocks.", "choices": [{ "text": "Fix", "outcome": "Exploded.", "hp": -20, "exp": 20, "stat": "ATK", "val": 3, "relic": false }, { "text": "Adapt", "outcome": "Younger.", "hp": 40, "exp": 0, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Digital dust.", "choices": [{ "text": "Touch", "outcome": "Info influx.", "hp": -5, "exp": 80, "stat": "NONE", "val": 0, "relic": false }, { "text": "Collect", "outcome": "Energy.", "hp": 0, "exp": 20, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Faceless clock.", "choices": [{ "text": "Draw", "outcome": "Redefined time.", "hp": 0, "exp": 50, "stat": "LUCK", "val": 1, "relic": false }, { "text": "Smash", "outcome": "Break shackles.", "hp": 0, "exp": 20, "stat": "ATK", "val": 3, "relic": false }]},
        { "text": "Slow time.", "choices": [{ "text": "Practice", "outcome": "See flaws.", "hp": 0, "exp": 30, "stat": "CRIT_RATE", "val": 0.04, "relic": false }, { "text": "Sleep", "outcome": "Recovered.", "hp": 100, "exp": 0, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Young boss.", "choices": [{ "text": "Ambush", "outcome": "Advantage.", "hp": 0, "exp": 50, "stat": "ATK", "val": 5, "relic": false }, { "text": "Observe", "outcome": "Weakness found.", "hp": 0, "exp": 40, "stat": "DEF", "val": 3, "relic": false }]},
        { "text": "Reverse hourglass.", "choices": [{ "text": "Break", "outcome": "Turbulence.", "hp": -30, "exp": 100, "stat": "NONE", "val": 0, "relic": false }, { "text": "Take", "outcome": "Treasure.", "hp": 0, "exp": 0, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Ticking.", "choices": [{ "text": "Calm", "outcome": "Tempered.", "hp": 0, "exp": 30, "stat": "DEF", "val": 3, "relic": false }, { "text": "Run", "outcome": "Speed up.", "hp": 0, "exp": 20, "stat": "DODGE", "val": 0.02, "relic": false }]},
        { "text": "Door 'Yesterday'.", "choices": [{ "text": "Open", "outcome": "Illusion.", "hp": -10, "exp": 30, "stat": "NONE", "val": 0, "relic": false }, { "text": "Seal", "outcome": "Gone.", "hp": 0, "exp": 20, "stat": "NONE", "val": 0, "relic": false }]}
      ],
      "zone5": [
        { "text": "Pixel world.", "choices": [{ "text": "Attack", "outcome": "Found item.", "hp": 0, "exp": 20, "stat": "NONE", "val": 0, "relic": true }, { "text": "Adapt", "outcome": "Survive data.", "hp": 0, "exp": 40, "stat": "DODGE", "val": 0.03, "relic": false }]},
        { "text": "Flickering body.", "choices": [{ "text": "Stabilize", "outcome": "Consumed stamina.", "hp": -20, "exp": 50, "stat": "DEF", "val": 5, "relic": false }, { "text": "Flicker", "outcome": "Hard to catch.", "hp": 0, "exp": 0, "stat": "DODGE", "val": 0.05, "relic": false }]},
        { "text": "Code line.", "choices": [{ "text": "Modify", "outcome": "Stats up.", "hp": 0, "exp": 0, "stat": "ATK", "val": 10, "relic": false }, { "text": "Delete", "outcome": "Enemy gone.", "hp": 0, "exp": 100, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Neon sign.", "choices": [{ "text": "Take", "outcome": "Weapon.", "hp": 0, "exp": 20, "stat": "ATK", "val": 3, "relic": false }, { "text": "Read", "outcome": "Don't look back.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Electronic cry.", "choices": [{ "text": "Find", "outcome": "AI core.", "hp": 0, "exp": 30, "stat": "NONE", "val": 0, "relic": true }, { "text": "Leave", "outcome": "Virus.", "hp": 0, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Zero gravity.", "choices": [{ "text": "Jump", "outcome": "High place.", "hp": 0, "exp": 40, "stat": "CRIT_RATE", "val": 0.04, "relic": false }, { "text": "Grab", "outcome": "Safe.", "hp": 10, "exp": 10, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Firewall.", "choices": [{ "text": "Brute force", "outcome": "Backlash.", "hp": -30, "exp": 80, "stat": "ATK", "val": 5, "relic": false }, { "text": "Exploit", "outcome": "Backdoor.", "hp": 0, "exp": 40, "stat": "LUCK", "val": 1, "relic": false }]},
        { "text": "Data torrent.", "choices": [{ "text": "Resist", "outcome": "Willpower.", "hp": 0, "exp": 50, "stat": "DEF", "val": 4, "relic": false }, { "text": "Flow", "outcome": "Unknown place.", "hp": -10, "exp": 30, "stat": "DODGE", "val": 0.02, "relic": false }]},
        { "text": "Save point.", "choices": [{ "text": "Load", "outcome": "Corrupted.", "hp": 0, "exp": 60, "stat": "CRIT_DMG", "val": 0.1, "relic": false }, { "text": "Overwrite", "outcome": "Set.", "hp": 20, "exp": 20, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Giant cursor.", "choices": [{ "text": "Attack", "outcome": "Shattered.", "hp": 0, "exp": 50, "stat": "ATK", "val": 4, "relic": false }, { "text": "Hide", "outcome": "Trash items.", "hp": 0, "exp": 20, "stat": "NONE", "val": 0, "relic": true }]}
      ],
      "zone6": [
        { "text": "Reality collapses.", "choices": [{ "text": "Adapt", "outcome": "Chaos.", "hp": 0, "exp": 50, "stat": "DODGE", "val": 0.05, "relic": false }, { "text": "Close eyes", "outcome": "Ignore.", "hp": 10, "exp": 20, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Another you.", "choices": [{ "text": "Kill", "outcome": "Demon gone.", "hp": -40, "exp": 200, "stat": "ATK", "val": 10, "relic": false }, { "text": "Hug", "outcome": "Merged.", "hp": 0, "exp": 100, "stat": "MAXHP", "val": 50, "relic": false }]},
        { "text": "Time stop.", "choices": [{ "text": "Break", "outcome": "Moving.", "hp": 0, "exp": 60, "stat": "ATK", "val": 5, "relic": false }, { "text": "Enjoy", "outcome": "Rest.", "hp": 50, "exp": 0, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Void swallows.", "choices": [{ "text": "Stare", "outcome": "Abyss.", "hp": -20, "exp": 100, "stat": "CRIT_DMG", "val": 0.2, "relic": false }, { "text": "Turn", "outcome": "Run.", "hp": 0, "exp": 30, "stat": "DODGE", "val": 0.03, "relic": false }]},
        { "text": "Causality weapon.", "choices": [{ "text": "Repair", "outcome": "Power.", "hp": 0, "exp": 0, "stat": "ATK", "val": 15, "relic": true }, { "text": "Dismantle", "outcome": "Materials.", "hp": 0, "exp": 80, "stat": "DEF", "val": 5, "relic": false }]},
        { "text": "Tangled timelines.", "choices": [{ "text": "Cut", "outcome": "Sever fate.", "hp": 0, "exp": 100, "stat": "CRIT_RATE", "val": 0.05, "relic": false }, { "text": "Untangle", "outcome": "Clear.", "hp": 20, "exp": 40, "stat": "NONE", "val": 0, "relic": false }]},
        { "text": "Meaning blurs.", "choices": [{ "text": "Shout", "outcome": "Exist!", "hp": 0, "exp": 50, "stat": "ATK", "val": 5, "relic": false }, { "text": "Carve", "outcome": "Mark.", "hp": 0, "exp": 50, "stat": "DEF", "val": 5, "relic": false }]},
        { "text": "Physics fail.", "choices": [{ "text": "Rewrite", "outcome": "God.", "hp": -50, "exp": 300, "stat": "LUCK", "val": 2, "relic": false }, { "text": "Drift", "outcome": "Survive.", "hp": 0, "exp": 20, "stat": "DODGE", "val": 0.05, "relic": false }]},
        { "text": "Final bell.", "choices": [{ "text": "Block", "outcome": "Stopped.", "hp": 0, "exp": 100, "stat": "DEF", "val": 8, "relic": false }, { "text": "Listen", "outcome": "Elegy.", "hp": -30, "exp": 0, "stat": "NONE", "val": 0, "relic": true }]},
        { "text": "Absolute dark.", "choices": [{ "text": "Light", "outcome": "Way.", "hp": 0, "exp": 100, "stat": "CRIT_RATE", "val": 0.1, "relic": false }, { "text": "Merge", "outcome": "Stealth.", "hp": 0, "exp": 50, "stat": "DODGE", "val": 0.1, "relic": false }]}
      ]
    }
  }
}

export const getZoneBoss = (zone: number, language: Language, luck: number = 0) => {
    const zoneBossesEn = ["Clockwork General", "Neon Dynasty Emperor", "Void Scholar", "Silicon Dragon", "Quantum Monk", "The Time Eater"];
    const zoneBossesZh = ["发条将军", "霓虹王朝皇帝", "虚空学者", "硅基龙神", "量子武僧", "吞噬时间者"];
    
    const bosses = language === 'zh' ? zoneBossesZh : zoneBossesEn;
    const bossIdx = Math.min(Math.max(0, zone - 1), 5);
    const bossName = bosses[bossIdx];

    // Luck scales boss stats
    const luckMult = 1 + (luck * 0.1); // 10% increase per luck point for bosses

    return {
        name: bossName,
        description: language === 'zh' 
          ? `区域 ${zone} 的守护者。`
          : `The guardian of Zone ${zone}.`,
        hp: Math.floor(((zone * 60) + 300) * luckMult),
        atk: Math.floor(((zone * 8) + 15) * luckMult)
    };
};

export const getFinalBoss = (player: Player, language: Language): Enemy => {
    // Calculate total stats for scaling
    const extraHp = player.inventory.filter(i => i.isEquipped).reduce((acc, i) => acc + (i.stats.HP || 0), 0);
    const totalMaxHp = player.maxHp + extraHp;
    
    // Luck scales final boss
    const luckMult = 1 + (player.luck * 0.1); 

    return {
        name: language === 'zh' ? "时间熵" : "Time Entropy",
        description: language === 'zh' ? "一切混乱的终极源头，它是所有未完成的时间线纠缠而成的怪物。" : "The source of all chaos, a monster formed from unfinished timelines.",
        hp: Math.floor((Math.floor(totalMaxHp * 5) + 2000) * luckMult),
        maxHp: Math.floor((Math.floor(totalMaxHp * 5) + 2000) * luckMult),
        atk: Math.floor((player.def * 2 + 50) * luckMult),
        isBoss: true,
        isFinalBoss: true,
        dropRate: 1.0
    };
};

export const generateScenario = async (player: Player, language: Language) => {
  const triggerCombat = Math.random() < 0.4;
  
  if (triggerCombat) {
    let enemyPool;
    const isZh = language === 'zh';
    const db = isZh ? ENEMIES_DB.zh : ENEMIES_DB.en;

    if (player.currentZone <= 2) enemyPool = db.low;
    else if (player.currentZone <= 4) enemyPool = db.mid;
    else enemyPool = db.high;

    // Safety fallback
    if (!enemyPool) enemyPool = db.low;

    const baseEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    
    // DIFFICULTY SCALING
    const zoneMult = 0.8 + (player.currentZone - 1) * 0.5;
    const luckMult = 1 + (player.luck * 0.05); // 5% harder per luck point for mobs
    
    const hp = Math.floor((player.level * 15 + 20 + Math.random() * 10) * zoneMult * luckMult);
    const atk = Math.floor((player.level * 2 + 5 + Math.random() * 3) * zoneMult * luckMult);

    return {
      description: language === 'zh' 
        ? `你在探索中遭遇了 ${baseEnemy.name}！\n${baseEnemy.desc}`
        : `You encountered a ${baseEnemy.name}!\n${baseEnemy.desc}`,
      hasCombat: true,
      enemyName: baseEnemy.name,
      enemyDesc: baseEnemy.desc,
      enemyHp: hp,
      enemyAtk: atk,
      isBoss: false,
      eventChoices: []
    };
  } else {
    const isZh = language === 'zh';
    const db = isZh ? EVENTS_DB.zh : EVENTS_DB.en;
    // Safety check if language key exists
    const events = db || EVENTS_DB.zh;
    
    let eventPool = [];
    if (player.currentZone === 1) eventPool = events.zone1 || [];
    else if (player.currentZone === 2) eventPool = events.zone2 || [];
    else if (player.currentZone === 3) eventPool = events.zone3 || [];
    else if (player.currentZone === 4) eventPool = events.zone4 || [];
    else if (player.currentZone === 5) eventPool = events.zone5 || [];
    else eventPool = events.zone6 || [];
    
    // Fallback
    if (!eventPool || eventPool.length === 0) {
        eventPool = events.zone1 || EVENTS_DB.zh.zone1;
    }

    const template = eventPool[Math.floor(Math.random() * eventPool.length)];
    
    return {
      description: template.text,
      hasCombat: false,
      eventChoices: template.choices.map((c: any) => ({
        text: c.text,
        outcomeDescription: c.outcome,
        hpChange: c.hp,
        expChange: c.exp,
        statId: c.stat,
        statValue: c.val,
        getRelic: c.relic
      }))
    };
  }
};

export const generateLoot = async (level: number, language: Language, luck: number = 0): Promise<Item> => {
  const itemPool = language === 'zh' ? ITEMS_DB.zh : ITEMS_DB.en;
  const template = itemPool[Math.floor(Math.random() * itemPool.length)];
  
  // Rarity Roll with Luck Modifier
  const luckBonus = luck * 0.01; 
  const roll = Math.random() + luckBonus;
  
  let rarity: Item['rarity'] = 'Common';
  let statCount = 1;
  
  if (roll > 0.95) { 
    rarity = 'Legendary'; 
    statCount = 4; 
  } else if (roll > 0.80) { 
    rarity = 'Epic'; 
    statCount = 3; 
  } else if (roll > 0.50) { 
    rarity = 'Rare'; 
    statCount = 2; 
  } else {
    rarity = 'Common';
    statCount = 1;
  }

  const stats: Partial<Record<StatType, number>> = {};
  const possibleStats = [StatType.ATK, StatType.DEF, StatType.HP, StatType.CRIT_RATE, StatType.CRIT_DMG, StatType.DODGE];

  for (let i = 0; i < statCount; i++) {
      const type = possibleStats[Math.floor(Math.random() * possibleStats.length)];
      let val = 0;
      const rarityMult = rarity === 'Legendary' ? 1.5 : rarity === 'Epic' ? 1.2 : rarity === 'Rare' ? 1.1 : 1.0;
      
      if (type === StatType.HP) val = (20 * level + 10) * rarityMult;
      else if (type === StatType.ATK) val = (2 * level + 2) * rarityMult;
      else if (type === StatType.DEF) val = (1 * level + 1) * rarityMult;
      else if (type === StatType.CRIT_RATE) val = 0.02 * rarityMult;
      else if (type === StatType.DODGE) val = 0.02 * rarityMult;
      else if (type === StatType.CRIT_DMG) val = 0.05 * rarityMult;

      if (type === StatType.CRIT_RATE || type === StatType.DODGE || type === StatType.CRIT_DMG) {
          val = Number(val.toFixed(3));
      } else {
          val = Math.floor(val);
      }
      stats[type] = (stats[type] || 0) + val;
  }

  return {
    id: crypto.randomUUID(),
    name: template.name,
    description: template.desc,
    rarity: rarity,
    isEquipped: false,
    stats: stats
  };
};

export const generateBossDialogue = async (zone: number, playerTruthScore: number, language: Language) => {
  const isZh = language === 'zh';
  const db = isZh ? BOSS_QUOTES_DB.zh : BOSS_QUOTES_DB.en;
  const idx = Math.min(Math.max(0, zone - 1), db.length - 1);
  const data = db[idx];
  return new Promise<any>((resolve) => {
      setTimeout(() => {
          resolve({
              dialogue: data.text,
              choices: [
                  { text: data.choiceIgnorance, isTruthful: false },
                  { text: data.choiceTruth, isTruthful: true }
              ]
          });
      }, 1000);
  });
};

export const generateEnding = async (truthScore: number, language: Language) => {
    const isZh = language === 'zh';
    const prompt = isZh
        ? `为游戏《时空混乱》生成大结局。玩家的“真相分数”为：${truthScore}/6。
           逻辑：
           - 如果分数 >= 4：真结局（打破循环，主角醒悟并逃离）。
           - 如果分数 < 4：坏结局（时间重置，循环继续，主角再次迷失）。
           要求：
           1. 必须严格使用简体中文。
           2. 内容生动，约 100 字。
           3. 返回 JSON：{ "title": "标题", "content": "内容" }。`
        : `Generate the ending for 'Time Chaos'. Truth Score: ${truthScore}/6.
           Logic:
           - Score >= 4: True Ending (Break the loop, escape).
           - Score < 4: Bad Ending (Loop resets, lost again).
           Requirements:
           1. Strict English only.
           2. Vivid description, approx 100 words.
           3. Return JSON: { "title": "string", "content": "string" }.`;
    try {
        return {
            title: isZh ? "结局" : "Ending",
            content: isZh ? "时间重置了。" : "Time resets."
        };
    } catch (e) {
        return {
            title: isZh ? "结局" : "Ending",
            content: isZh ? "时间重置了。" : "Time resets."
        };
    }
}