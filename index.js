const GAME_STATE = {
  FirstCardAwait: 'FirstCardAwaits',
  SecondCardAwait: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardMatched: 'CardMatched',
  GAmeFinished: 'GameFinished'
}
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg',
  'https://image.flaticon.com/icons/svg/105/105220.svg',
  'https://image.flaticon.com/icons/svg/105/105212.svg',
  'https://image.flaticon.com/icons/svg/105/105219.svg'
]


const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
    <img src="${symbol}" />
    <p>${number}</p>
    `
  },

  getCardElement(index) {
    return `<div data-index="${index}"class="card back"></div>  `
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => (this.getCardElement(index))).join('')
  },

  filpCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`

  },

  renderTiredTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      },
        {
          once: true
        }
      )
    })

  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }

}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = {
  revealedCards: [],
  isRevealCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 == this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.filpCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwait
        break

      case GAME_STATE.SecondCardAwait:
        view.renderTiredTimes(++model.triedTimes)
        view.filpCards(card)
        model.revealedCards.push(card)

        if (model.isRevealCardsMatched()) {
          //Matched Success
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //Matched Failed
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }

        break
    }

  },

  resetCards() {
    view.filpCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}



controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})