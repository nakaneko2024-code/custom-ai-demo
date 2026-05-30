// デイカウンター（2026-03-17 スタート）
function updateDayCounter() {
  const start = new Date('2026-03-17T00:00:00+09:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  const el = document.getElementById('day-count');
  if (el) el.textContent = 'Day ' + diff;
}

// ステップエンジン
// steps 配列の各要素：{ type: 'user'|'ai'|'end', text: '...', tip: '...' }
class DemoEngine {
  constructor(steps) {
    this.steps = steps;
    this.current = 0;
    this.chatScreen = document.getElementById('chat-screen');
    this.nextBtn = document.getElementById('next-btn');
    this.endScreen = document.getElementById('end-screen');
    this.phoneWrapper = document.getElementById('phone-wrapper');
    this.storyCard = document.getElementById('story-card');
    this.dots = document.querySelectorAll('.dot');
  }

  start() {
    this.storyCard.style.display = 'none';
    this.phoneWrapper.classList.add('visible');
    this.renderStep(0);
    this.updateDots();
  }

  next() {
    this.current++;
    if (this.current >= this.steps.length) return;
    this.renderStep(this.current);
    this.updateDots();
  }

  renderStep(index) {
    const step = this.steps[index];

    if (step.type === 'end') {
      this.phoneWrapper.style.display = 'none';
      this.endScreen.classList.add('visible');
      return;
    }

    // QUICK STARTチップス（最初のステップ）
    if (step.chips && step.chips.length > 0) {
      this._showChips(step.chips);
      return; // チップ選択後に次のステップへ進む
    }

    // 吹き出しを追加
    const row = document.createElement('div');
    row.className = 'bubble-row ' + step.type;
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + step.type;
    bubble.textContent = step.text;
    row.appendChild(bubble);
    this.chatScreen.appendChild(row);

    // フェードインアニメーション
    requestAnimationFrame(() => {
      requestAnimationFrame(() => row.classList.add('shown'));
    });

    // 誘導チップ（タップで次へ進める）
    if (step.tip) {
      // 古いチップを削除
      const oldTips = this.chatScreen.querySelectorAll('.guide-tip');
      oldTips.forEach(t => t.remove());

      const tip = document.createElement('div');
      tip.className = 'guide-tip';
      tip.textContent = '👆 ' + step.tip;
      tip.style.cursor = 'pointer';
      tip.addEventListener('click', () => this.next());
      this.chatScreen.appendChild(tip);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => tip.classList.add('shown'));
      });
    }

    // 最後のステップの手前でボタンラベルを変更
    const nextStep = this.steps[index + 1];
    if (nextStep && nextStep.type === 'end') {
      this.nextBtn.textContent = '終了 ✓';
    }

    this.chatScreen.scrollTop = this.chatScreen.scrollHeight;
  }

  _showChips(chips) {
    // 古いチップエリアを削除
    const oldArea = this.chatScreen.querySelector('.quick-start-area');
    if (oldArea) oldArea.remove();

    const area = document.createElement('div');
    area.className = 'quick-start-area';

    const label = document.createElement('span');
    label.className = 'qs-label';
    label.textContent = 'QUICK START';
    area.appendChild(label);

    const chipsWrap = document.createElement('div');
    chipsWrap.className = 'qs-chips';

    chips.forEach(text => {
      const chip = document.createElement('div');
      chip.className = 'qs-chip';
      chip.textContent = text;
      chip.addEventListener('click', () => {
        // タップアニメーション
        chip.classList.add('tapped');
        // チップエリアをフェードアウト
        area.style.transition = 'opacity 0.3s';
        area.style.opacity = '0';

        setTimeout(() => {
          area.remove();
          // ユーザーバブルとして表示
          const row = document.createElement('div');
          row.className = 'bubble-row user';
          const bubble = document.createElement('div');
          bubble.className = 'bubble user';
          bubble.textContent = text;
          row.appendChild(bubble);
          this.chatScreen.appendChild(row);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => row.classList.add('shown'));
          });
          this.chatScreen.scrollTop = this.chatScreen.scrollHeight;

          // 700ms後にAIの返答へ進む
          setTimeout(() => {
            this.current++;
            if (this.current < this.steps.length) {
              this.renderStep(this.current);
              this.updateDots();
            }
          }, 700);
        }, 300);
      });
      chipsWrap.appendChild(chip);
    });

    area.appendChild(chipsWrap);
    this.chatScreen.appendChild(area);
    this.chatScreen.scrollTop = this.chatScreen.scrollHeight;
  }

  updateDots() {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.current);
    });
  }
}

updateDayCounter();
