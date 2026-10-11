param([Parameter(Mandatory=$true)][string]$RequestFile)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding
try {
  $request = Get-Content -LiteralPath $RequestFile -Raw -Encoding UTF8 | ConvertFrom-Json
  $arguments = @('factory.bxs', "--description=$($request.description)", "--name=$($request.name)")
  if ($request.evaluate -eq $true) { $arguments += '--evaluate' }
  if ($request.aiRepair -eq $true) { $arguments += '--ai-repair' }
  & boxlang @arguments 2>&1 | ForEach-Object { [Console]::Out.WriteLine($_.ToString()); [Console]::Out.Flush() }
  $code = $LASTEXITCODE; if ($null -eq $code) { $code = 1 }; exit ([int]$code)
} finally { Remove-Item -LiteralPath $RequestFile -Force -ErrorAction SilentlyContinue }
