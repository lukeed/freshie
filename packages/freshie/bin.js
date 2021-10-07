const s=require("mri")(process.argv.slice(2),{default:{C:"."},boolean:["minify","sourcemap","ssr"],alias:{C:"cwd",m:"minify",x:"sourcemap",v:"version",h:"help"}});if(s.v&&(console.log("freshie, v1.2.3"),process.exit(0)),s.h){let e="";e+="\n  Usage",e+="\n    freshie <command> [options]",e+="\n",e+="\n  Available Commands",e+="\n    build    Build the project",e+="\n    dev      Develop the project",e+="\n",e+="\n  Options",e+="\n    -C, --cwd          Directory to resolve from  (default .)",e+="\n    -m, --minify       Minify built assets",e+="\n    -x, --sourcemap    Generate sourcemap(s)",e+="\n    -v, --version      Displays current version",e+="\n    -h, --help         Displays this message",e+="\n",process.stdout.write(e+"\n"),process.exit(0)}!async function(){try{if(!(s._[0]||"").trim().toLowerCase())throw new Error("Missing <command> argument");s._=s._.slice(1)}catch(e){console.error("ERROR",e.stack),process.exit(1)}}();
