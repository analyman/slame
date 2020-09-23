import * as gl from './global'
import * as utils from './utils'

import { do_misc } from './misc'
do_misc();

import { do_toc } from './toc'
do_toc();

import { do_fold } from './fold'
do_fold();


/** ? */
utils.call_register_functions();

