function gamble() {
    return Math.random() <= .95 ? getRandomIntInclusive(-100, 100) : -10000
}

function addEquip() {
    return [getRandomIntInclusive(0, 5), getRandomIntInclusive(0, 100)]
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

//document.querySelector('#submit').addEventListener('click', playGame)



function playGame() {
    class UI {
        constructor(header) {
            this.header = header
        }
        addHeader = function (text) {
            document.querySelector(this.header).innerHTML = text
        }
        createButtons = function (btnArr) {
            Array.from(document.querySelector('#buttons').children).forEach(el => el.remove())
            for (let i in btnArr) {
                document.querySelector('#buttons').insertAdjacentHTML('beforeend', `<button id="${btnArr[i]}" class="btn btn-success">${btnArr[i]}</button>`)
                document.getElementById(btnArr[i]).addEventListener('click', function() {
                    eventChooser(btnArr[i])
                })
            }
        }
    }
    
    class pC{
        constructor(name, lastname, baseHP) {
            this.name = name,
            this.lastname= lastname,
            this.currentLevel = 1,
            this.baseHP = baseHP
            this.currentHP = this.baseHP + this.currentLevel * 2,  
            this.isAlive = true,
            this.currentEquip = 0,
            this.pouch = 0,
            this.shopItem = [addEquip()[0], getRandomIntInclusive(50, 100)],
            this.hasShopped = false,
            this.xp = 0,
            this.isBattling = false   
        }
        getMaxHP = function() {
            return this.baseHP + this.currentLevel * 2
        }
        updateHP = function(damageTaken) {
            this.currentHP -= Math.floor((damageTaken - (damageTaken * (0.1 * this.currentEquip))))
        }

    }


    let ui = new UI('#header')
    let damage;
    //console.log(Array.from(document.querySelector('#buttons').children))
    let playerCharacter;
    
    playerCharacter = new pC(document.getElementById('name').value, document.getElementById('lastname').value, Number(document.getElementById('HP').value) ?  Number(document.getElementById('HP').value) : 32)
    Number(document.getElementById('HP').value) ? true : document.querySelector('#messages').insertAdjacentHTML('afterbegin', 'HP modifier invalid. We used a default value <health>32</health> instead.')
    console.log(playerCharacter.currentHP)
    document.querySelector('#starter').insertAdjacentHTML('afterend', '<br>')
    document.querySelector('#starter').remove()
    interimPeriod()
    
    
    function eventChooser(choice) { //Players choice on next action
        let text
        switch (choice) {
            case 'Venture Forth': 
                let encounter = eventStarter('Venture Forth')
                if (encounter == 'treasure') {
                    let item = addEquip()
                    text = ''
                    text += '<p>You happen to stumble upon treasure! Well done!</p>'
                    //document.querySelector('#interface').insertAdjacentHTML('afterend', '<p>You happen to stumble upon treasure! Well done!</p>')
    
                    if (item[0] > playerCharacter.currentEquip) {
                        text += `<p>You put on the superior armor to up your defense (Old Defense: ${playerCharacter.currentEquip}, New Defense: ${item[0]})</p>`
                        playerCharacter.currentEquip = item[0]
                    }
                    if (item[1] > 0) {
                        text += `<p>You collect <money>${item[1]}</money> Gold!</p>`
                        playerCharacter.pouch += item[1]
                    }
                    document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div>${text}</div`)
                }
                else if (encounter == 'battle') {
                    ui.addHeader('<p>It\'s a Battle!</p>')
                    battle()
                }
                else {
                    ui.addHeader('<p>You\'ve stumbled upon a town!</p>')
                    goToTown()
                }
                break;
            case 'Rest':
                playerCharacter.currentHP = playerCharacter.getMaxHP()
                document.querySelector('#messages').insertAdjacentHTML('afterbegin', '<div><p>You feel Refreshed.</p></div>')
                goToTown(playerCharacter.hasShopped ? 'noshop' : undefined)
                break;
            case 'Gamble for Money':
                console.log('yes')
                if (playerCharacter.pouch > 0) {
                    let winnings = gamble()
                    text = ''
                    if (winnings >= 0) {
                        text += `<p>You've won <money>${winnings}</money> Gold</p>`
                    }
                    else {
                        text += `<p>You've lost <money>${winnings * -1}</money> Gold</p>`
                    }
                    playerCharacter.pouch += winnings
                    if (playerCharacter.pouch <= 0) {
                        text += `<p>You\'ve run out of money!</p>`
                    }
                } else {
                    text = `<p>You can't gamble if you're broke!</p>`
                }
                console.log(text)
                document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div>${text}</div>`)
                goToTown(playerCharacter.hasShopped ? 'noshop' : undefined)
                break;
            case 'Shop':
                document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>You can buy a ${playerCharacter.shopItem[0]} defense armor from this shop for <money>${playerCharacter.shopItem[1]}</money> Gold. Buy it? (Current Defense: ${playerCharacter.currentEquip})</p></div>`)
                ui.createButtons(['Yes', 'No'])
                break;
            case 'Yes':
                if (playerCharacter.pouch >= playerCharacter.shopItem[1]) {
                    playerCharacter.currentEquip = (() => {return playerCharacter.shopItem[0]})()
                    document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>Thank you for your Patronage!</p></div>`)
                    playerCharacter.hasShopped = true
                    playerCharacter.pouch -= playerCharacter.shopItem[1]
                    playerCharacter.shopItem = [addEquip()[0], getRandomIntInclusive(50, 100)]
                }
                else {
                    document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>You cannot afford this item</p></div>`)
                }
                goToTown(playerCharacter.hasShopped ? 'noshop' : undefined)
                break;
            case 'No':
                document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>You leave the shop</p></div>`)
                goToTown(playerCharacter.hasShopped ? 'noshop' : undefined)
                break;
            case 'Leave Town':
                document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>You leave the Town</p></div>`)
                playerCharacter.shopItem = [addEquip()[0], getRandomIntInclusive(50, 100)]
                interimPeriod()
                break;
            case 'Normal Attack':
                text = ''
                damage = getRandomIntInclusive(10, 15)
                enemy.health -= damage
                text += `<p>You deal <damage>${damage}</damage> damage. The enemy has <health>${enemy.health}</health> health left!</p>`
                if (enemy.health <= 0) {
                    text += `<p>${enemy.type} has died. Well done!</p>`
                    let money = getRandomIntInclusive(25, 100)
                    playerCharacter.pouch += money
                    playerCharacter.xp += enemy.xp
                    text += `<p>You recieve ${enemy.xp} XP and recieve <money>${money}</money> gold!</p>`
                    playerCharacter.isBattling = false
                    if (playerCharacter.xp >= 10) {
                        playerCharacter.currentLevel++
                        playerCharacter.xp -= 10
                        text += `<p>You have leveled up to level ${playerCharacter.currentLevel}</p>`
                    }
                }
                if (playerCharacter.isBattling) {
                    damage = getRandomIntInclusive(3, 8)
                    playerCharacter.updateHP(damage)
                    text += `<p>${enemy.type} deals <damage>${Math.floor((damage - (damage * (0.1 * playerCharacter.currentEquip))))}</damage> damage. You have <health>${playerCharacter.currentHP}</health> health left!</p>`
    
                }
                document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div>${text}</div>`)
                if (playerCharacter.currentHP <= 0) {
                    ui.addHeader(`You have died. Game Over.`)
                    ui.createButtons([])
                } else if (playerCharacter.isBattling) {
                    battle()
                } else if (!playerCharacter.isBattling && playerCharacter.currentLevel < 10) {
                    interimPeriod()
                } else if (!playerCharacter.isBattling) {
                    win()
                }
                break;
            case 'Heavy Attack (Consumes 20% of Health)':
                damage = getRandomIntInclusive(20, 23)
                enemy.health -= damage
                text = ''
                text += `<p>You deal <damage>${damage}</damage> damage. The enemy has <health>${enemy.health}</health> health left, but you also dealt <damage>${Math.ceil(playerCharacter.currentHP * .2)}</damage> damage to yourself! You have <health>${playerCharacter.currentHP - Math.ceil(playerCharacter.currentHP * .2)}</health> health left.</p>`
                playerCharacter.currentHP -= Math.ceil(playerCharacter.currentHP * .2)
                if (enemy.health <= 0) {
                    text += `<p>${enemy.type} has died. Well done!</p>`
                    playerCharacter.xp += enemy.xp
                    let money = getRandomIntInclusive(25, 100)
                    playerCharacter.pouch += money
                    text += `<p>You recieve ${enemy.xp} XP and recieve <money>${money}</money> gold!</p>`
                    playerCharacter.isBattling = false
                    if (playerCharacter.xp >= 10) {
                        playerCharacter.currentLevel++
                        playerCharacter.xp -= 10
                        text += `<p>You have leveled up to level ${playerCharacter.currentLevel}</p>`
                    }
                }
                if (playerCharacter.isBattling) {
                    damage = getRandomIntInclusive(3, 8)
                    playerCharacter.updateHP(damage)
                    text += `<p>${enemy.type} deals <damage>${Math.floor((damage - (damage * (0.1 * playerCharacter.currentEquip))))}</damage> damage. You have <health>${playerCharacter.currentHP}</health> health left!</p>`
    
                }
                document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div>${text}</div>`)
                if (playerCharacter.currentHP <= 0) {
                    ui.addHeader(`You have died. Game Over.`)
                    ui.createButtons([])
                } else if (playerCharacter.isBattling) {
                    battle()
                } else if (!playerCharacter.isBattling && playerCharacter.currentLevel < 10) {
                    interimPeriod()
                } else if (!playerCharacter.isBattling) {
                    win()
                }
                break;
            case 'Flee':
                if (Math.random() <= .7) {
                    document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>You flee</p></div>`)
                    playerCharacter.isBattling = false
                    enemy = []
                    interimPeriod()
                } else {
                    document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>You cannot find an opening this round!</p></div>`)
                    battle()
                }
    
        }
    }
    
    function eventStarter(encounterType) { //Randomize Encounters
        if (encounterType == 'Venture Forth') {
            let randNum = Math.random()
            if (randNum <= .20) {
                return 'treasure'
            }
            else if (randNum <= .75) {
                return 'battle'
            }
            else {
                return 'town'
            }
        }
    }
    
    


    function interimPeriod() {
        ui.addHeader(`What will you do, ${playerCharacter.name} ${playerCharacter.lastname}?`)
        ui.createButtons(['Venture Forth'])
        console.log(playerCharacter.pouch)
    }




    function goToTown(x) {
        ui.createButtons(x == 'noshop' ? ['Rest', 'Gamble for Money', 'Leave Town'] : ['Rest', 'Gamble for Money', 'Shop', 'Leave Town'])
        if (playerCharacter.hasShopped == true) {
            playerCharacter.shopItem = [addEquip()[0], getRandomIntInclusive(50, 100)]
            playerCharacter.hasShopped = false
        }
        //console.log(playerCharacter.shopItem)
        document.querySelector('#messages').insertAdjacentHTML('afterbegin', `<div><p>What will you do in Town?</p></div>`)
    }



    class Monster {
        constructor(type, health, setType, setHP, xp) {
            this.type = type
            this.setType = () => {
                this.type = monsters[getRandomIntInclusive(0, monsters.length - 1)]
            }
            this.health = health
            this.setHP = () => {
                this.health = getRandomIntInclusive(50, 100)
            }
            this.xp = xp
        }
    }
    const monsters = ['Zombie', 'Ogre', 'Bandit']
    let enemy = []

    function battle() {
        if (!playerCharacter.isBattling) {
            console.log('gamer')
            enemy = new Monster()
            enemy.setHP()
            enemy.setType()
            enemy.xp = Math.floor(enemy.health / 10)
            playerCharacter.isBattling = true
        }
        ui.addHeader(`Enemy ${enemy.type} is attacking with <health>${enemy.health}</health> health! What will you do?`)
        ui.createButtons(['Normal Attack', 'Heavy Attack (Consumes 20% of Health)', 'Flee'])
    }

    function win() {
        ui.createButtons([])
        ui.addHeader(`You've made it to level 10 and beat the game!`)
        console.log('You\'re Winner!')
    }
}