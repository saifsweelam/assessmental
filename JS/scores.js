var model = {
    init: function () {
        if (!localStorage.assessmental) {
            let name = prompt('Welcome!\nPlease enter your name.', 'Guest')
            let data = { name: name, quizzes: [], score: 0 }
            localStorage.assessmental = JSON.stringify(data)
        }
    },
    getData: function () {
        return JSON.parse(localStorage.assessmental)
    }
}

var operator = {
    init: function () {
        model.init()
        view.init()
    },
    getData: function () {
        return model.getData()
    }
}

var view = {
    init: function () {
        this.name = document.querySelector('#name')
        this.score = document.querySelector('#score')
        this.numOfQuizzes = document.querySelector('#num-of-quizzes')
        this.level = document.querySelector('#level')
        this.updateData()
        this.facebookBtn = document.querySelector('.social-btns .fa-facebook')
        this.twitterBtn = document.querySelector('.social-btns .fa-twitter')
        this.whatsappBtn = document.querySelector('.social-btns .fa-whatsapp')
        this.addShareEvents()
    },
    updateData: function () {
        let data = operator.getData()
        this.name.textContent = data.name
        this.score.textContent = data.score
        this.numOfQuizzes.textContent = data.quizzes.length
        this.level.textContent = this.getLevel(data.quizzes.length, data.score)
    },
    getLevel: function (num, score) {
        if (num === 0) {
            return 'NOT RATED'
        }
        let average = score / num
        return 'EXCELLENT'
    },
    addShareEvents: function () {
        let data = operator.getData()
        let url = 'http://saifsweelam.github.io/assessmental'
        let message = `I scored ${data.score} points from ${data.quizzes.length} quizzes at AssessMental!  Enter now and show me the score you'll get.  `
        this.facebookBtn.addEventListener('click', function () {
            window.open(`https://www.facebook.com/dialog/share?app_id=525011614828926&display=popup&href=http://saifsweelam.github.io/assessmental&quote=${message}`, 'popup', 'width=600,height=600')
        })
        this.twitterBtn.addEventListener('click', function() {
            window.open(`https://twitter.com/share?url=${url}&via=SaifSweelam&text=${message}`, 'popup', 'width=600,height=600')
        })
        this.whatsappBtn.addEventListener('click', function() {
            window.open(`https://api.whatsapp.com/send?text=${message}${url}`, 'popup', 'width=600,height=600')
        })
    }
}

operator.init()