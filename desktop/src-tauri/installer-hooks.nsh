; Phones reach the game server over the local network, so the sidecar needs an inbound allow rule.
; Without one, Windows asks on the first launch, and a dismissed prompt leaves the phones locked out.
; The rule covers private and public profiles because Windows files most home Wi-Fi as public;
; remoteip=localsubnet keeps it to devices on the same network.

!macro KTO_FIREWALL_CLEAR
  ; also clears the block rules Windows writes when its prompt was denied
  nsExec::ExecToLog '"$SYSDIR\netsh.exe" advfirewall firewall delete rule name=all program="$INSTDIR\kto-server.exe"'
  Pop $0
!macroend

!macro NSIS_HOOK_POSTINSTALL
  !insertmacro KTO_FIREWALL_CLEAR
  nsExec::ExecToLog '"$SYSDIR\netsh.exe" advfirewall firewall add rule name="Kto iz nas game server" dir=in action=allow protocol=TCP program="$INSTDIR\kto-server.exe" profile=private,public remoteip=localsubnet enable=yes'
  Pop $0
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro KTO_FIREWALL_CLEAR
!macroend
