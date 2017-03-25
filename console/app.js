/* App Code */

<!--

/*
multiple terminal test for termlib.js

(c) Norbert Landsteiner 2003-2005
mass:werk - media environments
<http://www.masswerk.at>

*/
var mountedDir = '';
var appDir    = specialdirectory.currentdirectory;
appDir        = appDir.substring(0, appDir.lastIndexOf("\\"));
var appname    = '';
var apptitle   = '';
var procID     = 0;
var term       = new Array();

var helpPage=[
    '%CS%+r Terminal Help %-r%n',
    '  This is just a tiny test for multiple terminals.',
    '  use one of the following commands:',
    '     clear ........ clear the terminal',
    '     exit ......... close the terminal ( or unmount ) <ECS>',
    '     id ........... show terminal\'s id',
    '     help ......... show this help page',
    '     SDK -ls ...... list all the installed Engines',
    '     SDK -i ....... install a new SDK',
    '     dir -mount ... mount the specified directory',
    '     dir -unmount . unmount the mounted directory',
    '     xs -create ... create a new project',
    '     xs -build .... build project',
    '     xs -run ...... run application',
    '     xs -exit ..... close application',
    '  other input will be echoed to the terminal.',
    ' '
];

var aboutTerm=[
'About Developer Command Prompt for Xylon Studio',
    ' ',
    'Author: Donald Pakkies',
    'License: GPL v3',
    'Version: 1.0'
];

var aboutTerm2 =[
'about',
    'About Developer Command Prompt for Xylon Studio',
    ' ',
    'Author: Donald Pakkies',
    'License: GPL v3',
    'Version: 1.0'
];

function termOpen(n) {
        if (!term[n]) {
            var y=(n==1)? 70: 280;
            term[n]=new Terminal(
                {
                    x: 220,
                    y: y,
                    rows: 21,
                    cols: 94, 
                    //greeting: 'Type "help" for help.%n',
                    id: n,
                    termDiv: 'termDiv'+n,
                    crsrBlinkMode: true,
                    handler: termHandler,
                    exitHandler: termExitHandler
                }
            );
            if (term[n]) term[n].open();
        }
        else if (term[n].closed) {
            term[n].open();
        }
        else {
            term[n].focus();
        }
}

function termHandler() {
    // called on <CR> or <ENTER>
    
    this.newLine();
    var cmd = this.lineBuffer;
    if (cmd!='') {
        if (cmd=='clear') {
            this.clear();
            this.prompt();
        }
        else if (cmd=='exit') {
            this.close();
            application.destroy();
        }
        else if (cmd=='about') {
            this.write(aboutTerm);
            this.newLine();
            this.prompt();
        }
        else if (cmd=='help') {
            this.write(helpPage);
            this.newLine();
            this.prompt();
        }
        else if (cmd=='id') {
            this.write('terminal id: ' + this.id);
            output.writeline('terminal id: ' + this.id);
            this.newLine();
            this.prompt();
        }
        else if (cmd == 'SDK -ls') 
        {
            var searchHere = appDir + '\\SDK';
            sDirectory.getDirectories(searchHere);
        }
        else if (cmd.startsWith('xs -create')) 
        {
            var create = cmd;
            create     = create.replace('xs -create ', '');
            sDirectory.exists(mountedDir + create);
            this.prompt();
            if (sDirectory.directoryExists == true)
            {
                output.writeline("Can't create project. Path already exists");
                this.write("Can't create project. Path already exists");
            }
            else
            {
                sDirectory.exists(specialdirectory.currentdirectory + '/app/example/project');
                if (sDirectory.directoryExists == true)
                {
                    sDirectory.copyTo(specialdirectory.currentdirectory + '/app/example/project', mountedDir + create);
                    
                    setname(mountedDir + create + '/' + create + '.xsproj', mountedDir + create + '/My Project/application.apc', create);
                    sDirectory.copyTo(specialdirectory.currentdirectory + '/app/example/files', mountedDir + create + '/' + create.replace(' ', ''));
                    output.writeline('"' +  create + '" has been successfuly created');
                    this.write('"' + create + '" has been successfuly created');
                }
                else
                {
                    output.writeline('Cannot locate the required files to create ' + create);
                    this.write('Cannot locate the required files to create ' + create);
                }
            }
            this.newLine();
            this.prompt();
        }
        else if (cmd.startsWith('xs -build')) 
        {
            var build = cmd;
            build     = build.replace('xs -build ', '');
            this.prompt();
            newProcess.start(appDir + '/IDE/xspb.exe', mountedDir + build);
            output.writeline('Building...');
            this.write('Building...');
        }
        else if (cmd.startsWith('xs -run')) 
        {
            var exe = cmd;
            exe     = exe.replace('xs -run ', '');
            this.prompt();
            newProcess.start(mountedDir + exe, '');
            procID = newProcess.id;
        }
        else if (cmd == 'xs -exit') {
            newProcess.kill(procID);
            this.prompt();
        }
        else if (cmd.startsWith('dir -mount')) {
            var dir = cmd;
            dir     = dir.replace('dir -mount ', '');
            sDirectory.exists(dir);
            this.prompt();
            if (sDirectory.directoryExists == true)
            {
                mountDirectory(dir);
                output.writeline(mountedDir + ' has been successfuly mounted');
                this.write(mountedDir + ' has been successfuly mounted');
                document.title = mountedDir;
            }
            else 
            {
                output.writeline(dir + " doesn't exist");
                this.write(dir + " doesn't exist");
            }
            this.prompt();
        }
        else if (cmd.startsWith('dir -unmount')) 
        {
            this.prompt();
            if (document.title == 'terminal') 
            {
                var cmdDir = cmd.replace('dir -unmount ', '');
                this.write(cmdDir + ' is not mounted');
                output.writeline(cmdDir + ' is not mounted');
                this.newLine();
            }
            else 
            {
                this.write(' ' + document.title + ' has been successfuly unmounted');
                output.writeline(' ' + document.title + ' has been successfuly unmounted');
                this.newLine();
                mountedDir     = '';
                document.title = 'Developer Command Promt for Xylon Studio';
            }
            this.prompt();
        }
        else {
            this.prompt();
            this.type('"' + cmd + '"' + ' is not recognized as an internal command.');
            output.writeline('"' + cmd + '"' + ' is not recognized as an internal command.');
            this.newLine();
            this.prompt();
        }
    }
}

function mountDirectory(dir) {
    if (dir.endsWith('/'))
    {
        mountedDir = dir;;
    }
    else
    {
        mountedDir = dir + '/';;
    }
}

function termExitHandler() {
    // optional handler called on exit
    // activate other terminal if open
    var other=(this.id==1)? 2:1;
    if ((term[other]) && (term[other].closed==false)) term[other].focus();
}
//-->

function process_data(data){
    procID = newProcess.id;
    term[2].write(data);
    term[2].newLine();
    term[2].prompt(); 
}

function process_onExit() {
    term[2].write('Done!');
    term[2].prompt();
}

function getFiles_onRetrieve(sdk) {
    term[2].write(sdk);
    term[2].newLine();
    term[2].prompt();
}

function application_onReady() {
    systemmenu.enable('About', 'aboutWindow();');
    application.onExit('application.destroy();');
}

function aboutWindow() {
    term[2].write(aboutTerm2);
    term[2].newLine();
    term[2].prompt();
}

function setname(url, url2, name) {
    //Xylon Project
    file.read(specialdirectory.currentdirectory + '/app/example/project_template.xsproj');
    var xsproj  = file.results;
    var appid   = name.replace(' ', '');
    var appname = name.replace(/[^A-Za-z0-9]/g, '');
    appid       = appid.replace(/[^A-Za-z0-9]/g, '');
    appid       = appid.toLowerCase();
    xsproj      = xsproj.replace('[app_name]', appname.replace(' ', ''));
    xsproj      = xsproj.replace('windows.[app_name]', 'windows.' + appid);
    file.write(url, xsproj);
    
    //Application APC
    file.read(specialdirectory.currentdirectory + '/app/example/application_template.apc');
    var apc = file.results;
    apc     = apc.replace('[app_name].exe', appname.replace(' ', '') + '.exe');
    apc     = apc.replace('windows.[app_name]', 'windows.' + appid);
    file.write(url2, apc);
    
}

function console_Load() {
    document.title                 = 'Developer Command Promt for Xylon Studio';
    document.body.style.background = '#000';
    document.body.style.color      = 'white';
    document.body.style.margin     = '0px';
    termOpen(2);
    application.width(680);
    application.height(360);
    application.run();
}