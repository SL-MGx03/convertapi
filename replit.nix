# This file tells Replit to install system-level packages.
# We need LibreOffice for its powerful document conversion capabilities.
{ pkgs }: {
  deps = [
    # Use the standard Node.js 18 environment
    pkgs.nodejs-18_x
    
    # This is the magic line that installs the full LibreOffice suite
    pkgs.libreoffice
  ];
}
