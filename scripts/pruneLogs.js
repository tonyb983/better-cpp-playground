// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { existsSync, readdirSync } from 'node:fs'
import { opendir, readdir } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { subDays, differenceInDays } from 'date-fns'

import { isArray, launch } from './util.js'

launch('pruneLogs.js', async (ctx) => {
    const getLogFiles = async (targetDir) => {
        if (!existsSync(targetDir)) {
            throw new Error(`targetDir (${targetDir}) does not exist`)
        }

        let files = new Map()
        const dir = await opendir(targetDir);
        ctx.logger.info(`Reading ${dir}`)
        for await (const dirent of dir) {
            ctx.logger.info(`Stepping into ${dirent.name}`)
            if (dirent.isDirectory()) {
                const dirFiles = readdirSync(resolve(targetDir, dirent.name), { withFileTypes: true })
                    .filter(de => de.isFile() && de.name.endsWith('.log'))
                files.set(dirent.name, dirFiles.map(de => resolve(targetDir, dirent.name, de.name)))
            }
        }

        return files
    }

    const scriptLogDir = ctx.project.scriptsLogDir()
    ctx.logger.info(`scriptLogDir: ${scriptLogDir}`)
    const files = await getLogFiles(scriptLogDir)
    ctx.logger.info(`files: ${JSON.stringify(files, null, 2)}`)
    await ctx.utils.waitForAnyKey()
    const allFiles = Array.from(files.values()).flat()

    ctx.logger.info('Found ' + allFiles.length + ' log files')
    if (allFiles.length < 1) {
        ctx.logger.warn('No log files found, exiting')
        return
    }
    let oldFiles = []
    const largeDirs = Array.from(files.entries())
        .filter(([dir, files]) => files.length > 20)
        .map(([dir, files]) => files
            .splice(0, files.length - 20)
            .map(rm => resolve(dir, rm)))

    ctx.logger.info(`Large Dirs: ${JSON.stringify(largeDirs, null, 2)}`)
    ctx.logger.info(`AllFiles: ${JSON.stringify(allFiles, null, 2)}`)

    const cutoff = subDays(new Date(), 3)
    Array.from(allFiles.entries()).forEach(([dir, files]) => isArray(files) && files.forEach(file => {
        const base = basename(file)
        const year = parseInt(base.substring(0, 4))
        const month = parseInt(base.substring(4, 6))
        const day = parseInt(base.substring(6, 8))
        if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
            ctx.logger.warn(`Unable to parse the date from ${base}`)
            return
        }

        const fileDate = new Date(year, month - 1, day)
        const diff = differenceInDays(fileDate, cutoff)
        // ctx.logger.info(`Difference in days between cutoff (${cutoff}) and fileDate (${fileDate}) is ${diff}`)
        if (diff < 1) {
            oldFiles.push(resolve(dir, file))
        }
    }))

    ctx.logger.info(`Old Files: ${JSON.stringify(oldFiles, null, 2)}`)
})