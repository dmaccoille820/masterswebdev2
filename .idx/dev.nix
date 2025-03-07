# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.mysql80
    pkgs.sass
  ];


  # Sets environment variables in the workspace
  env = { 
    MYSQL_SOCKET = "\${DATA_DIR}/mysql-project-idx/data/mysql.sock";
    DB_HOST = "localhost";
    DB_USER = "root";
    DB_PASSWORD = "123456";
    DB_NAME = "TaskTracker";
    DB_PORT = "3306";
  };
  idx = {
    
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      
    ];
    
     workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        npm-install = "npm ci --no-audit --prefer-offline --no-progress --timing";
        run-dev = "npm run dev";
      };
     
    };
  # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
       "web" = {
          command = [ "node" "server/app.js" "mysql-project-idx/start.sh" ];
          
         env = {
            PORT = "$PORT";
          };
          manager = "web";
        };
       };
    };
  };
}
