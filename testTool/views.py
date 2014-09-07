#+
# Copyright 2010 iXsystems, Inc.
# All rights reserved
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted providing that the following conditions
# are met:
# 1. Redistributions of source code must retain the above copyright
#    notice, this list of conditions and the following disclaimer.
# 2. Redistributions in binary form must reproduce the above copyright
#    notice, this list of conditions and the following disclaimer in the
#    documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
# IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
# OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
# STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
# IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#
#####################################################################
from collections import OrderedDict
import cPickle as pickle
import json
import logging
import os
import re
import shutil
import signal
import socket
import subprocess
#import sysctl
import time
import urllib
import xmlrpclib
"""
from django.contrib.auth import login, get_backends
from django.core.servers.basehttp import FileWrapper
from django.core.urlresolvers import reverse
from django.db import transaction
from django.http import (
    HttpResponse,
    HttpResponseRedirect,
    StreamingHttpResponse,
)
from django.shortcuts import render
from django.utils.translation import ugettext as _
from django.views.decorators.cache import never_cache
"""
"""
from freenasOS.Update import (
    ActivateClone,
    CheckForUpdates,
    DeleteClone,
    Update,
)
from freenasUI.account.models import bsdUsers
from freenasUI.common.locks import mntlock
from freenasUI.common.system import (
    get_sw_name,
    get_sw_version,
    send_mail
)
from freenasUI.common.pipesubr import pipeopen
from freenasUI.common.ssl import (
    export_certificate,
    export_privatekey,
)
from freenasUI.freeadmin.apppool import appPool
from freenasUI.freeadmin.views import JsonResp
from freenasUI.middleware.exceptions import MiddlewareError
from freenasUI.middleware.notifier import notifier
from freenasUI.network.models import GlobalConfiguration
from freenasUI.storage.models import MountPoint
from freenasUI.system import forms, models
from freenasUI.system.utils import CheckUpdateHandler, UpdateHandler
"""

GRAPHS_DIR = '/var/db/graphs'
VERSION_FILE = '/etc/version'
PGFILE = '/tmp/.extract_progress'
DDFILE = '/tmp/.upgrade_dd'
RE_DD = re.compile(r"^(\d+) bytes", re.M | re.S)
PERFTEST_SIZE = 40 * 1024 * 1024 * 1024  # 40 GiB

log = logging.getLogger('system.views')


class UnixTransport(xmlrpclib.Transport):
    def make_connection(self, addr):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(addr)
        self.sock.settimeout(5)
        return self.sock

    def single_request(self, host, handler, request_body, verbose=0):
        # issue XML-RPC request

        self.make_connection(host)

        try:
            self.sock.send(request_body + "\n")
            p, u = self.getparser()

            while 1:
                data = self.sock.recv(1024)
                if not data:
                    break
                p.feed(data)

            self.sock.close()
            p.close()

            return u.close()
        except xmlrpclib.Fault:
            raise
        except Exception:
            # All unexpected errors leave connection in
            # a strange state, so we clear it.
            self.close()
            raise


class MyServer(xmlrpclib.ServerProxy):

    def __init__(self, addr):

        self.__handler = "/"
        self.__host = addr
        self.__transport = UnixTransport()
        self.__encoding = None
        self.__verbose = 0
        self.__allow_none = 0

    def __request(self, methodname, params):
        # call a method on the remote server

        request = xmlrpclib.dumps(
            params,
            methodname,
            encoding=self.__encoding,
            allow_none=self.__allow_none,
        )

        response = self.__transport.request(
            self.__host,
            self.__handler,
            request,
            verbose=self.__verbose
        )

        if len(response) == 1:
            response = response[0]

        return response

    def __getattr__(self, name):
        # magic method dispatcher
        return xmlrpclib._Method(self.__request, name)


#def terminal(request):
def terminal(array):
    """
    sid = int(request.POST.get("s", 0))
    jid = request.POST.get("jid", 0)
    shell = request.POST.get("shell", "")
    k = request.POST.get("k")
    w = int(request.POST.get("w", 80))
    h = int(request.POST.get("h", 24))

    s=849266249&jid=&shell=&w=80&h=24&k=
    k : command. example => ls
    """
    sid = array[0]
    jid = array[1]
    shell = array[2]
    w = array[3]
    h = array[4]
    k = array[5]


    multiplex = MyServer("/var/run/webshell.sock")
    alive = False
    for i in range(3):
        try:
            alive = multiplex.proc_keepalive(sid, jid, shell, w, h)
            break
        except Exception, e:
        #    notifier().restart("webshell")
            time.sleep(0.5)
    print alive

    try:
        if alive:
            if k:
                multiplex.proc_write(
                    sid,
                    xmlrpclib.Binary(bytearray(k.encode('utf-8')))
                )
            time.sleep(0.002)
            #content_data = '<?xml version="1.0" encoding="UTF-8"?>' + \
            #    multiplex.proc_dump(sid)
            #response = HttpResponse(content_data, content_type='text/xml')
            print multiplex.proc_dump(sid)
            #return response
        else:
            #response = HttpResponse('Disconnected')
            #response.status_code = 400
            print "400"
            #return response
    except (KeyError, ValueError, IndexError, xmlrpclib.Fault), e:
        #response = HttpResponse('Invalid parameters: %s' % e)
        #response.status_code = 400
        print "400"
        #return response


def terminal_paste(request):
    return render(request, "system/terminal_paste.html")


if __name__ == '__main__':

    #terminal()

    array = [18,"","",80,24,"ls\n"]
    terminal(array)

    time.sleep(1)
    array = [18,"","",80,24,""]
    terminal(array)


    array = [18,"","",80,24,""]
    while 1:
        time.sleep(1)
        terminal(array)


