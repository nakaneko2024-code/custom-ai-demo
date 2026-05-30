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
// steps: { type: 'user', chips: [...] } | { type: 'ai', text: '...', choices: [...] } | { type: 'end' }
class DemoEngine {
  constructor(steps) {
    this.steps = steps;
    this.current = 0;
    this.chatScreen = document.getElementById('chat-screen');
    this.chatInput = document.getElementById('chat-input');
    this.inputArea = document.getElementById('chat-input-area');
    this.endScreen = document.getElementById('end-screen');
    this.phoneWrapper = document.getElementById('phone-wrapper');
    this.storyCard = document.getElementById('story-card');
    this.dots = document.querySelectorAll('.dot');
    this._setupKeyboard();
  }

  _setupKeyboard() {
    if (this.chatInput) {
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
          e.preventDefault();
          this.send();
        }
      });
    }
  }

  start() {
    this.storyCard.style.display = 'none';
    this.phoneWrapper.classList.add('visible');
    this.renderStep(0);
    this.updateDots();
  }

  // 送信ボタン or Enter で呼ばれる
  send() {
    // 既に最後のステップなら何もしない
    if (this.current >= this.steps.length - 1) return;

    const text = this.chatInput ? this.chatInput.value.trim() : '';

    // 既存のchoice-chips-wrapを削除
    this.chatScreen.querySelectorAll('.choice-chips-wrap').forEach(c => c.remove());

    if (text) {
      // テキストをユーザーバブルとして表示
      this._addBubble('user', text);
      if (this.chatInput) this.chatInput.value = '';
      // 700ms後に次のAIステップへ
      setTimeout(() => this._advance(), 700);
    } else {
      // テキストなしでもそのまま次へ
      this._advance();
    }
  }

  _advance() {
    this.current++;
    if (this.current >= this.steps.length) return;
    this.renderStep(this.current);
    this.updateDots();
  }

  _addBubble(type, text) {
    const row = document.createElement('div');
    row.className = 'bubble-row ' + type;
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + type;
    bubble.textContent = text;
    row.appendChild(bubble);
    this.chatScreen.appendChild(row);
    requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add('shown')));
    this.chatScreen.scrollTop = this.chatScreen.scrollHeight;
  }

  renderStep(index) {
    const step = this.steps[index];

    if (step.type === 'end') {
      this.phoneWrapper.style.display = 'none';
      this.endScreen.classList.add('visible');
      return;
    }

    // QUICK STARTチップス（chips ありの user ステップ）
    if (step.chips && step.chips.length > 0) {
      this._showStartChips(step.chips);
      if (this.inputArea) this.inputArea.style.display = 'block';
      return;
    }

    // 通常バブル（ai または user）
    this._addBubble(step.type, step.text);

    // AIバブルのchoicesチップ
    if (step.type === 'ai' && step.choices && step.choices.length > 0) {
      setTimeout(() => this._showChoiceChips(step.choices), 400);
    }

    if (this.inputArea) this.inputArea.style.display = 'block';
    this.chatScreen.scrollTop = this.chatScreen.scrollHeight;
  }

  // AIバブル下に表示する選択肢チップ
  _showChoiceChips(choices) {
    const wrap = document.createElement('div');
    wrap.className = 'choice-chips-wrap';
    wrap.style.opacity = '0';
    wrap.style.transition = 'opacity 0.3s';

    choices.forEach(text => {
      const chip = document.createElement('button');
      chip.className = 'ai-choice-chip';
      chip.textContent = '・' + text;
      chip.addEventListener('click', () => {
        // トグル選択
        chip.classList.toggle('selected');
        if (this.chatInput) {
          // 選択中のチップを入力欄に反映
          const selected = Array.from(wrap.querySelectorAll('.ai-choice-chip.selected'))
            .map(c => c.textContent.replace(/^・/, '').trim());
          this.chatInput.value = selected.join('、');
          this.chatInput.focus();
        }
      });
      wrap.appendChild(chip);
    });

    this.chatScreen.appendChild(wrap);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrap.style.opacity = '1';
        this.chatScreen.scrollTop = this.chatScreen.scrollHeight;
      });
    });
  }

  // 最初のQUICK STARTチップス
  _showStartChips(chips) {
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
        chip.classList.add('tapped');
        area.style.transition = 'opacity 0.3s';
        area.style.opacity = '0';

        setTimeout(() => {
          area.remove();
          this._addBubble('user', text);

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
