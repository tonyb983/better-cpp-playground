// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import fs from 'fs/promises'
import path from 'path'
import { execaCommand } from 'execa'
import { PrettyLogger } from './pp.js'
import project from './projectInfo.js'
import { applyExtensions } from './util.js'
applyExtensions()

const logger = new PrettyLogger('protoGen', { consoleLog: true })

const main = async () => {
    let success = true
    try {
        const hasProtoc = await execaCommand('protoc --version')
        logger.logi(`hasProtoc: ${JSON.stringify(hasProtoc)}\n`)
    } catch (err) {
        success = false
        logger.loge('Unable to find proto compiler.')
        return
    }

    const genDir = path.resolve(project.protoDir(), 'gen')
    logger.logi(`generated dir: ${genDir}`)
    logger.logi(`removing generated dir`)
    await fs.rm(genDir, { recursive: true })
    logger.logi(`recreating generated dir`)
    await fs.mkdir(genDir)
    logger.logi(`gathering proto files`)
    const protos = await fs.readdir(project.protoDir(), { withFileTypes: true })
        .then(files => files
            .filter(de => de.isFile() && de.name.endsWith('.proto'))
            .map(de => path.relative(project.projectDir, path.join(project.protoDir(), de.name))))

    logger.logi(`calling proto compiler with ${protos.length} files (${protos.join(', ')})`)
    // const protoPath = path.resolve('C:\\ProgramData\\chocolatey\\lib\\protoc\\tools\\include\\')
    // const cmd = `protoc --cpp_out=${genDir} --proto_path=${protoPath} ${protos.join(' ')}`
    const cmd = `protoc --cpp_out=${genDir} ${protos.join(' ')}`
    logger.logi(`cmd: ${cmd}`)
    const result = await execaCommand(cmd)
    logger.logi(`protoc result: ${JSON.stringify(result)}`)

    const generated = await fs.readdir(path.resolve(genDir, 'proto'), { withFileTypes: true })
    const msgProject = path.resolve(project.projectDir, 'packages', 'messages')
    const msgInclude = path.resolve(msgProject, 'include', 'pg', 'gen')
    const msgSrc = path.resolve(msgProject, 'src')
    generated
        .filter(de => de.isFile() && (de.name.endsWith('.pb.h') || de.name.endsWith('.pb.cc')))
        .map(de => de.name)
        .forEach(f => {
            if (f.endsWith('.pb.h')) {
                const dest = path.join(msgInclude, f)
                fs.copyFile(path.resolve(genDir, 'proto', f), dest)
            } else if (f.endsWith('.pb.cc')) {
                const dest = path.join(msgSrc, f)
                fs.copyFile(path.resolve(genDir, 'proto', f), dest)
            }
        })

    logger.logi(`Main complete.`)
}

main().catch(err => logger.loge(`Error during main: ${err}`))