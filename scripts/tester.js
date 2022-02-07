// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { PrettyLogger } from './pp.js'
import project from './projectInfo.js'



const logger = new PrettyLogger('tester', { consoleLog: true })
logger.info('Info message from tester')
logger.warn('Warning message from tester')
logger.error('Error message from tester')


logger.logi(JSON.stringify(project, null, 2) + '\n')
logger.logi('build dir: ' + project.buildDir())
logger.logi('log dir: ' + project.logDir())
logger.logi('proto dir: ' + project.protoDir())
logger.logi('scripts dir: ' + project.scriptsDir())
logger.logi('scripts log dir: ' + project.scriptsLogDir())
logger.logi('timing dir: ' + project.timingDir())
logger.logi('timingCombinedFilename: ' + project.timingCombinedFilename)
logger.logi('timingExt: ' + project.timingExt)