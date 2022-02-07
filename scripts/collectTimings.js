// Copyright 2022 Tony Barbitta
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fs from 'fs'
import { basename, join, resolve } from 'path'
import { PrettyLogger } from './pp.js'

import { applyExtensions } from './util.js'
applyExtensions()

import project from './projectInfo.js'

const logger = new PrettyLogger('collectTimings', { consoleLog: true })

logger.logi('Collecting timing data from buildDir...')

const timingDir = resolve(project.timingDir())
const buildDir = resolve(project.buildDir())
logger.logi(`Found timingDir: ${timingDir}`)
logger.logi(`Found buildDir: ${buildDir}`)

/** @type {(dir: fs.PathLike) => string[]} */
const expandDir = (dir) => fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(de => de.isDirectory() ? expandDir(join(dir, de.name)) : join(dir, de.name))

expandDir(buildDir)
    .tap((files) => logger.logi(`Found ${files.length} files in buildDir.`))
    .filter(fn => fn.endsWith(project.timingExt))
    .tap((files) => logger.logi(`Found ${files.length} timing files in build dir.`))
    .forEach(fn => {
        const src = fn
        const nameNoExt = basename(fn, project.timingExt)
        const nameExt = basename(fn)
        const dest = join(timingDir, nameExt)
        if (fs.existsSync(dest)) {
            logger.logw('Destination file already exists: ' + dest)
            let i = 1
            while (i <= 100) {
                const attempt = join(timingDir, `${nameNoExt}${i}${project.timingExt}`)
                if (!fs.existsSync(attempt)) {
                    fs.copyFileSync(src, attempt)
                    return;
                } else {
                    logger.logw('Destination file already exists: ' + attempt)
                }
                i += 1
            }
            logger.loge(`Unable to copy file ${src} after 100 attempts. This probably shouldn't happen...`)
        } else {
            logger.logi(`Copying ${src} to ${dest}`)
            fs.copyFileSync(src, dest)
        }
    })
