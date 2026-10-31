/* BATTLE FIT LAB ポケモン候補拡張（2026-10・試験版）
   既存のメガシンカ0〜3匹機能と診断画面を維持。
   技・特性・持ち物の未確認事項は空欄として表示。 */
(() => {
  'use strict';
  const rows = `
アシレーヌ|みず・フェアリー|special,power,bulk
ブリジュラス|はがね・ドラゴン|special,bulk,power
サーフゴー|はがね・ゴースト|special,power
ゴリランダー|くさ|physical,power,pivot
グソクムシャ|むし・みず|physical,bulk,power
カバルドン|じめん|physical,bulk,support
セグレイブ|ドラゴン・こおり|physical,power,setup
ルカリオ|かくとう・はがね|physical,power,speed
ボーマンダ|ドラゴン・ひこう|physical,speed,setup
リザードン|ほのお・ひこう|special,power,speed
オオニューラ|かくとう・どく|physical,speed,power
エースバーン|ほのお|physical,speed,pivot
ゲッコウガ|みず・あく|special,speed,pivot
バンギラス|いわ・あく|physical,power,bulk
ドドゲザン|あく・はがね|physical,power,bulk
ウルガモス|むし・ほのお|special,power,setup
ラグラージ|みず・じめん|physical,bulk,support
サザンドラ|あく・ドラゴン|special,power,pivot
カビゴン|ノーマル|physical,bulk
ドヒドイデ|どく・みず|bulk,support
ガオガエン|ほのお・あく|physical,bulk,pivot
ミロカロス|みず|special,bulk
ブラッキー|あく|bulk,support
オーロンゲ|あく・フェアリー|physical,support,bulk
マリルリ|みず・フェアリー|physical,power,bulk
ドリュウズ|じめん・はがね|physical,power,speed
ヒートロトム|でんき・ほのお|special,pivot,bulk
エルレイド|エスパー・かくとう|physical,power
デカヌチャン|フェアリー・はがね|physical,support
フシギバナ|くさ・どく|special,bulk
メタグロス|はがね・エスパー|physical,power,bulk
マホイップ|フェアリー|special,bulk,support
ジャローダ|くさ|special,speed,setup
マンムー|こおり・じめん|physical,power
シャンデラ|ゴースト・ほのお|special,power
ギルガルド|はがね・ゴースト|physical,special,bulk
ウインディ|ほのお|physical,pivot,bulk
グレンアルマ|ほのお・エスパー|special,power
ソウブレイズ|ほのお・ゴースト|physical,setup
ペリッパー|みず・ひこう|special,pivot,support
オーダイル|みず|physical,power,setup
ムクホーク|ノーマル・ひこう|physical,speed,pivot
メガニウム|くさ|bulk,support
バシャーモ|ほのお・かくとう|physical,power,speed
ラウドボーン|ほのお・ゴースト|special,bulk
フーディン|エスパー|special,speed,power
ミミロップ|ノーマル|physical,speed
ヘラクロス|むし・かくとう|physical,power
オニシズクモ|みず・むし|physical,bulk
ピクシー|フェアリー|special,bulk,support
ジュカイン|くさ|special,speed
コノヨザル|かくとう・ゴースト|physical,bulk,setup
クレッフィ|はがね・フェアリー|support,bulk
エアームド|はがね・ひこう|bulk,support
ゾロアーク（ヒスイ）|ノーマル・ゴースト|special,speed
キラフロル|いわ・どく|special,support
ライチュウ|でんき|special,speed
シャワーズ|みず|special,bulk
サンダース|でんき|special,speed
リーフィア|くさ|physical,bulk
エーフィ|エスパー|special,speed
ブースター|ほのお|physical,power
ドサイドン|じめん・いわ|physical,power,bulk
ファイアロー|ほのお・ひこう|physical,speed,pivot
キョジオーン|いわ|bulk,support
メガルカリオ|かくとう・はがね|mega,physical,power,speed|ルカリオナイト
メガリザードンX|ほのお・ドラゴン|mega,physical,power,setup|リザードナイトX
メガフシギバナ|くさ・どく|mega,special,bulk|フシギバナイト
メガサーナイト|エスパー・フェアリー|mega,special,power|サーナイトナイト
メガバンギラス|いわ・あく|mega,physical,power,bulk|バンギラスナイト
メガハッサム|むし・はがね|mega,physical,bulk,pivot|ハッサムナイト
`.trim().split('\n');

  const roles = {pivot:'対面操作',support:'サポート',speed:'高速アタッカー',bulk:'耐久型',physical:'物理アタッカー',special:'特殊アタッカー'};
  rows.forEach((row, i) => {
    const [name, type, tagText, stone] = row.split('|');
    if (mons.some(m => m.name === name)) return;
    const tags = tagText.split(',');
    const first = tags.find(t => roles[t]) || 'physical';
    const m = {
      id: 'extra-' + i, name, type, tags,
      emoji: tags.includes('mega') ? '✦' : '◇',
      color: tags.includes('mega') ? '#eee6ff' : '#eaf3ff',
      role: roles[first], nature: '要確認', ability: '要確認',
      item: stone || '要確認', pts: null, moves: [],
      description: '診断の候補として登録。現在のレギュレーションと育成内容は要確認。'
    };
    mons.push(m);
    byId[m.id] = m;
    aliases[m.name] = m.id;
  });

  // 既存の診断を生かしつつ、追加候補も選べるようにする。
  const previousCalc = calc;
  calc = function () {
    const r = previousCalc();
    const s = r.scores;
    const requested = typeof selectedMegaCount === 'number'
      ? Math.max(0, Math.min(3, selectedMegaCount))
      : r.team.filter(m => m.tags?.includes('mega')).length;
    const favoriteIds = r.favs.map(n => aliases[n] || 'custom:' + n);
    const isMega = m => Boolean(m.tags?.includes('mega'));
    const has = (m, t) => Boolean(m.tags?.includes(t));
    const seed = questions.reduce((n, q) => n * 7 + ((state.answers[q.id] || 'A').charCodeAt(0) % 11), 0) % 997;
    const baseIds = new Set(r.team.map(m => m.id));

    function fit(m, picked) {
      let score = 0;
      if (has(m,'physical')) score += (s.attack + s.power) * .45;
      if (has(m,'special')) score += (s.attack + s.power) * .4;
      if (has(m,'pivot')) score += s.pivot * 1.1;
      if (has(m,'bulk')) score += s.bulk * .8 + s.safe * .35;
      if (has(m,'speed')) score += s.speed * 1.1;
      if (has(m,'setup')) score += s.setup * 1.2;
      if (has(m,'support')) score += s.safe * .35;
      if (baseIds.has(m.id)) score += 2;
      if (has(m,'mega') && state.answers[13] === 'A' && has(m,'physical')) score += 8;
      if (has(m,'mega') && state.answers[13] === 'B' && has(m,'speed')) score += 8;
      if (has(m,'mega') && state.answers[13] === 'C' && has(m,'bulk')) score += 8;
      const primary = m.type.split('・')[0];
      score -= picked.filter(x => x.type.split('・')[0] === primary).length * 8;
      for (const role of ['physical','special','pivot','speed']) {
        if (has(m,role) && !picked.some(x => has(x,role))) score += 9;
      }
      // 回答が異なると同点候補の優先順位も変わる。
      score += ((m.id.length * 37 + [...m.id].reduce((n,c) => n + c.charCodeAt(0), seed)) % 19) / 6;
      return score;
    }

    const chosen = [];
    const megas = mons.filter(isMega);
    const fixedMegas = r.team.filter(m => isMega(m) && favoriteIds.includes(m.id));
    for (const m of fixedMegas.slice(0, requested)) if (!chosen.includes(m)) chosen.push(m);
    while (chosen.length < requested) {
      const available = megas.filter(m => !chosen.some(x => x.id === m.id));
      if (!available.length) break;
      available.sort((a,b) => fit(b,chosen) - fit(a,chosen));
      chosen.push(available[0]);
    }
    // メガ指定数を優先し、それ以外のお気に入りを守る。
    for (const id of favoriteIds) {
      const m = r.team.find(x => x.id === id) || byId[id];
      if (m && !isMega(m) && !chosen.some(x => x.id === m.id) && chosen.length < 6) chosen.push(m);
    }
    while (chosen.length < 6) {
      const available = mons.filter(m => !isMega(m) && !chosen.some(x => x.id === m.id));
      if (!available.length) break;
      available.sort((a,b) => fit(b,chosen) - fit(a,chosen));
      chosen.push(available[0]);
    }
    r.team = chosen;
    const baseLeads = [...r.lead, ...chosen.map(m => m.id)];
    r.lead = [...new Set(baseLeads)].filter(id => chosen.some(m => m.id === id)).slice(0,3);
    return r;
  };
})();

/* BATTLE FIT LAB v4.1 育成案追加パッチ
   pokemon-expansion.js の末尾に追記して使う。
   性格・特性・技は参考候補であり、現行のCH技習得・解禁状況は未検証。
   能力PはH/A/B/C/D/Sの順、各32以下・合計66。
*/
(() => {
  'use strict';
  const profiles = `
アシレーヌ|げきりゅう|ひかえめ|HC|ムーンフォース,うたかたのアリア,れいとうビーム,アンコール
ブリジュラス|がんじょう|ひかえめ|HC|りゅうせいぐん,ラスターカノン,ボディプレス,ステルスロック
サーフゴー|おうごんのからだ|おくびょう|CS|ゴールドラッシュ,シャドーボール,わるだくみ,じこさいせい
ゴリランダー|グラスメイカー|いじっぱり|HA|グラススライダー,ウッドハンマー,とんぼがえり,はたきおとす
グソクムシャ|ききかいひ|いじっぱり|HA|であいがしら,アクアブレイク,きゅうけつ,ふいうち
カバルドン|すなおこし|わんぱく|HB|じしん,ステルスロック,あくび,なまける
セグレイブ|ねつこうかん|ようき|AS|つららばり,きょけんとつげき,りゅうのまい,じしん
ルカリオ|せいしんりょく|ようき|AS|インファイト,コメットパンチ,しんそく,つるぎのまい
ボーマンダ|いかく|ようき|AS|げきりん,じしん,りゅうのまい,はねやすめ
リザードン|もうか|おくびょう|CS|かえんほうしゃ,エアスラッシュ,りゅうのはどう,おにび
オオニューラ|かるわざ|ようき|AS|フェイタルクロー,インファイト,アクロバット,つるぎのまい
エースバーン|リベロ|ようき|AS|かえんボール,とんぼがえり,ふいうち,とびひざげり
ゲッコウガ|げきりゅう|おくびょう|CS|ハイドロポンプ,あくのはどう,れいとうビーム,とんぼがえり
バンギラス|すなおこし|いじっぱり|HA|ストーンエッジ,かみくだく,じしん,りゅうのまい
ドドゲザン|そうだいしょう|いじっぱり|HA|ドゲザン,アイアンヘッド,ふいうち,つるぎのまい
ウルガモス|ほのおのからだ|おくびょう|CS|ほのおのまい,むしのさざめき,ちょうのまい,ギガドレイン
ラグラージ|げきりゅう|わんぱく|HB|じしん,クイックターン,ステルスロック,れいとうパンチ
サザンドラ|ふゆう|おくびょう|CS|あくのはどう,りゅうせいぐん,かえんほうしゃ,とんぼがえり
カビゴン|あついしぼう|いじっぱり|HA|のしかかり,じしん,のろい,ねむる
ドヒドイデ|さいせいりょく|ずぶとい|HB|じこさいせい,どくどく,くろいきり,アクアブレイク
ガオガエン|いかく|わんぱく|HB|フレアドライブ,はたきおとす,すてゼリフ,おにび
ミロカロス|ふしぎなうろこ|ずぶとい|HB|なみのり,れいとうビーム,じこさいせい,くろいきり
ブラッキー|シンクロ|しんちょう|HD|イカサマ,ねがいごと,まもる,あくび
オーロンゲ|いたずらごころ|しんちょう|HD|ソウルクラッシュ,リフレクター,ひかりのかべ,でんじは
マリルリ|ちからもち|いじっぱり|HA|アクアジェット,じゃれつく,アクアブレイク,はらだいこ
ドリュウズ|かたやぶり|ようき|AS|じしん,アイアンヘッド,つるぎのまい,こうそくスピン
ヒートロトム|ふゆう|ずぶとい|HB|ボルトチェンジ,オーバーヒート,おにび,10まんボルト
エルレイド|きれあじ|いじっぱり|HA|せいなるつるぎ,サイコカッター,かげうち,つるぎのまい
デカヌチャン|かたやぶり|しんちょう|HD|デカハンマー,じゃれつく,でんじは,アンコール
フシギバナ|しんりょく|ずぶとい|HB|ギガドレイン,ヘドロばくだん,こうごうせい,やどりぎのタネ
メタグロス|クリアボディ|いじっぱり|HA|コメットパンチ,しねんのずつき,じしん,バレットパンチ
マホイップ|スイートベール|ずぶとい|HB|マジカルシャイン,めいそう,じこさいせい,マジカルフレイム
ジャローダ|あまのじゃく|おくびょう|CS|リーフストーム,へびにらみ,みがわり,やどりぎのタネ
マンムー|あついしぼう|ようき|AS|じしん,つららばり,こおりのつぶて,ステルスロック
シャンデラ|もらいび|ひかえめ|CS|シャドーボール,かえんほうしゃ,エナジーボール,トリック
ギルガルド|バトルスイッチ|ひかえめ|HC|シャドーボール,ラスターカノン,キングシールド,かげうち
ウインディ|いかく|いじっぱり|HA|フレアドライブ,しんそく,おにび,あさのひざし
グレンアルマ|もらいび|ひかえめ|HC|アーマーキャノン,サイコキネシス,エナジーボール,めいそう
ソウブレイズ|もらいび|いじっぱり|AS|むねんのつるぎ,かげうち,つるぎのまい,インファイト
ペリッパー|あめふらし|ずぶとい|HB|ぼうふう,なみのり,とんぼがえり,はねやすめ
オーダイル|ちからずく|ようき|AS|アクアブレイク,れいとうパンチ,りゅうのまい,じしん
ムクホーク|いかく|ようき|AS|ブレイブバード,インファイト,とんぼがえり,でんこうせっか
メガニウム|しんりょく|ずぶとい|HB|ギガドレイン,やどりぎのタネ,こうごうせい,リフレクター
バシャーモ|かそく|いじっぱり|AS|フレアドライブ,インファイト,まもる,つるぎのまい
ラウドボーン|てんねん|ずぶとい|HB|フレアソング,シャドーボール,なまける,おにび
フーディン|マジックガード|おくびょう|CS|サイコキネシス,シャドーボール,きあいだま,アンコール
ミミロップ|ぶきよう|ようき|AS|のしかかり,トリプルアクセル,でんこうせっか,アンコール
ヘラクロス|こんじょう|ようき|AS|インファイト,メガホーン,ロックブラスト,つるぎのまい
オニシズクモ|すいほう|いじっぱり|HA|アクアブレイク,きゅうけつ,ねばねばネット,ミラーコート
ピクシー|てんねん|ずぶとい|HB|ムーンフォース,めいそう,つきのひかり,かえんほうしゃ
ジュカイン|しんりょく|おくびょう|CS|リーフストーム,りゅうのはどう,きあいだま,みがわり
コノヨザル|まけんき|いじっぱり|HA|ふんどのこぶし,ドレインパンチ,ビルドアップ,ちょうはつ
クレッフィ|いたずらごころ|ずぶとい|HB|リフレクター,ひかりのかべ,でんじは,イカサマ
エアームド|がんじょう|わんぱく|HB|ブレイブバード,ステルスロック,はねやすめ,ふきとばし
ゾロアーク（ヒスイ）|イリュージョン|おくびょう|CS|シャドーボール,ハイパーボイス,かえんほうしゃ,わるだくみ
キラフロル|どくげしょう|おくびょう|CS|パワージェム,ヘドロウェーブ,だいちのちから,ステルスロック
ライチュウ|ひらいしん|おくびょう|CS|10まんボルト,ボルトチェンジ,くさむすび,アンコール
シャワーズ|ちょすい|ずぶとい|HB|なみのり,れいとうビーム,ねがいごと,まもる
サンダース|ちくでん|おくびょう|CS|10まんボルト,ボルトチェンジ,シャドーボール,でんじは
リーフィア|ようりょくそ|ようき|AS|リーフブレード,つるぎのまい,シザークロス,でんこうせっか
エーフィ|マジックミラー|おくびょう|CS|サイコキネシス,マジカルシャイン,めいそう,あさのひざし
ブースター|こんじょう|いじっぱり|HA|フレアドライブ,からげんき,でんこうせっか,おにび
ドサイドン|ハードロック|いじっぱり|HA|じしん,ロックブラスト,れいとうパンチ,ステルスロック
ファイアロー|はやてのつばさ|ようき|AS|ブレイブバード,フレアドライブ,とんぼがえり,おにび
キョジオーン|きよめのしお|わんぱく|HB|しおづけ,じこさいせい,まもる,てっぺき
メガルカリオ|てきおうりょく|ようき|AS|インファイト,コメットパンチ,バレットパンチ,つるぎのまい
メガリザードンX|かたいツメ|ようき|AS|フレアドライブ,ドラゴンクロー,りゅうのまい,じしん
メガフシギバナ|あついしぼう|ずぶとい|HB|ギガドレイン,ヘドロばくだん,こうごうせい,やどりぎのタネ
メガサーナイト|フェアリースキン|おくびょう|CS|ハイパーボイス,サイコショック,マジカルフレイム,めいそう
メガバンギラス|すなおこし|いじっぱり|HA|ストーンエッジ,かみくだく,じしん,りゅうのまい
メガハッサム|テクニシャン|いじっぱり|HA|バレットパンチ,とんぼがえり,つるぎのまい,はねやすめ
`.trim().split('\n');

  // H/A/B/C/D/Sの合計は必ず66P、どの能力も最大32P
  const spreads = {
    HA:[32,32,0,0,2,0], AS:[2,32,0,0,0,32],
    HC:[32,0,2,32,0,0], CS:[2,0,0,32,0,32],
    HB:[32,0,32,0,2,0], HD:[32,0,2,0,32,0]
  };
  let updated = 0;
  for (const line of profiles) {
    const [name, ability, nature, spread, moveCSV] = line.split('|');
    const m = mons.find(x => x.name === name);
    if (!m || !m.id.startsWith('extra-')) continue;
    const pts = spreads[spread];
    const moves = moveCSV.split(',');
    if (!pts || pts.reduce((a,b)=>a+b,0)!==66 || pts.some(v=>v>32) || moves.length!==4) {
      console.error('育成データに問題があります:', name);
      continue;
    }
    m.ability=ability;
    m.nature=nature;
    m.pts=[...pts];
    m.moves=moves;
    m.description='役割に合わせた仮の育成案です。技・特性はチャンピオンズの現行仕様と照合してください。';
    updated++;
  }
  console.info('BATTLE FIT LAB 育成データ追加:', updated, '/', profiles.length);
})();
