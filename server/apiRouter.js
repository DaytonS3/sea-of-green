const express = require('express');
const router = express.Router();
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises

const git = (command, canReject=false) => {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if(err && canReject){
                reject({err: true, msg: err})
            } else if( err){
                resolve({err: true, msg: err})
            } else {
                resolve({err: false, msg: stdout})
            }
        })
    })
}

const check = (numberOfCommits) => {
    fs()
}

const doesPathExist = (path) => {
    return new Promise((resolve, reject) => {
        resolve(fs.existsSync(path))
    })
}

const createFolder = (path) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, err => {
            if(err){
                console.log('err in mkdir', err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

const createFile = (path, content=null) => {
    if(!content){
        content = Date.now()
    }
    console.log('path', content, path)
    return new Promise((resolve, reject) => {
        fs.writeFile(path, `change made at: ${content}\n`, (err) => {
            if(err){
                console.log('Failed to write file', err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}
const appendFile = (path, content=null) => {
    if(!content){
        content = Date.now()
    }
    console.log('path', content, path)
    return new Promise((resolve, reject) => {
        fs.appendFile(path, `change made at: ${content}\n`, (err) => {
            if(err){
                console.log('Failed to write file', err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

router.get('/git', async (req, res, next) => {
    try {
        console.log('git')
        const stopIfFails = true
        const folderLocation = path.join(__dirname + '/randomCommits.txt')

        await git('git status', stopIfFails).catch(err => { throw 'failed to aquire status'})
        console.log('folderLocation', folderLocation)
        const fileExists = await doesPathExist(folderLocation)
        console.log('fileExists', fileExists)
        if(!fileExists){
            await createFile(folderLocation).catch(err => { throw 'failed to make folder'})
        }
        

        await appendFile(`timestamps.txt`).catch(err => { throw ' failed to write file'})
        const tryAdd = await git('git add .')

        console.log('tryAdd', tryAdd)
        
        const status = await git('git status', stopIfFails).catch(err => {throw 'failed to aquire status'})
        console.log('status', status)
        
        const tryCommit = await git('git commit -m"hello, git."')

        
        if(tryCommit.err){
            console.log('err', tryCommit.msg)
            throw 'error commiting'
        } else {
            console.log('isCool', tryCommit.msg)
        }
        await git('git push origin HEAD')

        const gitLog = await git('git log')
        // .then(res => {
        //     console.log('res', res)
        // }).catch(err => {
        //     console.log('err at command', err)
        //     // throw err
        // })
        console.log('===========TWO===========')
        // await git('git add .')
        // await git('git reset HEAD')
        res.status(200).send(`commits made`)
    } catch (err) {
        console.log('endpoint catch', err)
        res.status(500).json(err)
    }
})

module.exports = router;
