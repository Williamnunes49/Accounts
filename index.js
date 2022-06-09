// modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

// modulos internos
const fs = require('fs')

operation()

function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você dejesa fazer?',
            choices: [
             'Criar Conta',
             'Consultar Saldo',
             'Depositar',
             'Sacar',
             'Excluir Conta',
             'Sair',

            ],
        
        },
    ])
    
    .then((answer) => {
        const action = answer['action']
        
        if(action === 'Criar Conta') {
            creatAccounts()
        } else if(action === 'Consultar Saldo') {
            getAccountBalance()
        } else if(action === 'Depositar') {
            deposit()
        } else if(action === 'Sacar') {
            withDraw()
        } else if(action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        } else if(action === 'Excluir Conta') {
            warning()
        }
    })
    .catch((err) => console.log(err))

}

// create user account
function creatAccounts() {
    console.log(chalk.green.bold('Parabéns por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir:'))
    
    buildAccount()
}

function deleteAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome, da conta que dejesa excluir:',
        }
        
    ])
    .then((answer) => {
        const accountName = answer['accountName']

       if(!fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Está conta não existe, escolha outro nome!'))
            return deleteAccount()
            
        }

       fs.unlink(`accounts/${accountName}.json`,function(err) {
              if(err) {
                  console.log(err)
                  return
              }
            },
            console.log(chalk.red.bold('Conta excluida com sucesso!')),
            newOperation()
        )

    })
    .catch(err => console.log(err))
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite uma nome para a sua conta:'
        },
    ])
    
    .then((answer) => {
        const accountName = answer['accountName']
        
        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))
            
            buildAccount(accountName)
            return
        } 

        if(!accountName) {
            console.log(chalk.bgRed.black('Atenção, o nome é obrigatório!'))
            buildAccount(accountName)
            return
        }
        
        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', 
            function(err) {
              console.log(err)
            }
        )

        console.log(chalk.bgGreen.black(`Parabéns ${accountName}, sua conta foi criada com sucesso!`))
        operation()

    })
    .catch(err => console.log(err))

}

// add an amount to user account
function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        },
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        // verify if account exists
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você dejesa depositar?',
            },
        ])
        .then((answer) => {
            const amount =  answer['amount']

            // add an amount
            addAmount(accountName, amount)
            return newOperation()


        }).catch(err => console.log(err))

        
    })
    .catch(err => console.log(err))
}

// check if account exists
function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Está conta não existe, escolha outro nome!'))
        return false;
    }
    return true
}

function addAmount(accountName, amount) {
    const accountData =  getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },

        console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta.`)),
    )
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    
    })
    return JSON.parse(accountJSON)
}

// check account balance
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }

    ]).then((answer) => {
        const accountName = answer['accountName']

        // verify if account exists
        if(!checkAccount(accountName)) {
            return getAccountBalance()

        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá ${accountName}, o saldo da sua conta é R$${accountData.balance}`))

        return newOperation()
        
    })
    .catch(err => console.log(err))
}

// get money from account
function withDraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        },
        
    ])
    .then((answer) => {
        const  accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return withDraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message:'Quanto você deseja sacar?'
            },
        ])

        .then((answer) => {
            const amount = answer['amount']

            removeAmonut(accountName, amount) 
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function removeAmonut(accountName, amount) {
    
    const accountData = getAccount(accountName, amount) 

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return withDraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed('Saldo insuficiente!'))
        return withDraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },

    )
    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta.\nSeu saldo atual é R$${accountData.balance}`))
    newOperation()

}

function newOperation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'finish',
            message: 'Deseja realizar nova operação?',
            choices: [
                'Sim',
                'Não',
            ],
        }
    ])

    .then((answer) => {
        const finish = answer['finish']

        if(finish === 'Sim') {
            return operation()
        }

        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
        process.exit()
    })
    .catch(err => console.log(err))
} 

// draws the user's attention
function warning() {
    console.log(chalk.bgRed.black("Atenção!\nEstá ação, não poderá ser desfeita!\nDeseja continuar?"))

    inquirer.prompt([
        {
            type: 'list',
            name: 'opcao',
            choices:['Sim', 'Não'] 
        }
    ])

    .then((answer) => {
        const opcao =  answer['opcao']

        if(opcao === 'Sim') {
            deleteAccount()
        } else {
            operation()
        }
    })
}