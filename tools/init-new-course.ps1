[CmdletBinding()]
param(
  [string]$SpecOutPath = '',
  [string]$CourseDir = '',
  [switch]$Force,
  [switch]$NoScaffold,
  [switch]$UseExample
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($SpecOutPath)) {
  $SpecOutPath = Join-Path $repoRoot 'docs\new-course-template\course-init.spec.generated.json'
}
$specOutPath = [System.IO.Path]::GetFullPath($SpecOutPath)
$courseDir = if ([string]::IsNullOrWhiteSpace($CourseDir)) { '' } else { [System.IO.Path]::GetFullPath($CourseDir) }
$node = (Get-Command node -ErrorAction Stop).Source
$validateScript = Join-Path $repoRoot 'tools\validate-init-spec.mjs'
$initScript = Join-Path $repoRoot 'tools\init-new-course.mjs'

function Read-RequiredText {
  param(
    [string]$Prompt,
    [string]$Default = ''
  )

  while ($true) {
    $suffix = if ([string]::IsNullOrWhiteSpace($Default)) { '' } else { " [$Default]" }
    $value = Read-Host "$Prompt$suffix"
    if ([string]::IsNullOrWhiteSpace($value)) {
      $value = $Default
    }
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value.Trim()
    }
    Write-Host 'This field is required.' -ForegroundColor Yellow
  }
}

function Read-OptionalText {
  param(
    [string]$Prompt,
    [string]$Default = ''
  )

  $suffix = if ([string]::IsNullOrWhiteSpace($Default)) { '' } else { " [$Default]" }
  $value = Read-Host "$Prompt$suffix"
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $Default
  }
  return $value.Trim()
}

function Read-YesNo {
  param(
    [string]$Prompt,
    [bool]$Default = $true
  )

  $defaultToken = if ($Default) { 'Y/n' } else { 'y/N' }
  while ($true) {
    $value = Read-Host "$Prompt [$defaultToken]"
    if ([string]::IsNullOrWhiteSpace($value)) {
      return $Default
    }
    switch ($value.Trim().ToLowerInvariant()) {
      'y' { return $true }
      'yes' { return $true }
      'n' { return $false }
      'no' { return $false }
      default { Write-Host 'Please answer y or n.' -ForegroundColor Yellow }
    }
  }
}

function Read-IntegerValue {
  param(
    [string]$Prompt,
    [int]$Default
  )

  while ($true) {
    $value = Read-Host "$Prompt [$Default]"
    if ([string]::IsNullOrWhiteSpace($value)) {
      return $Default
    }
    $parsed = 0
    if ([int]::TryParse($value.Trim(), [ref]$parsed)) {
      return $parsed
    }
    Write-Host 'Please enter an integer.' -ForegroundColor Yellow
  }
}

function Read-ChoiceValue {
  param(
    [string]$Prompt,
    [string[]]$Choices,
    [string]$Default
  )

  $choiceSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($choice in $Choices) {
    [void]$choiceSet.Add($choice)
  }

  while ($true) {
    $value = Read-Host "$Prompt [$Default] options: $($Choices -join ', ')"
    if ([string]::IsNullOrWhiteSpace($value)) {
      return $Default
    }
    $trimmed = $value.Trim()
    if ($choiceSet.Contains($trimmed)) {
      return $trimmed
    }
    Write-Host "Please choose one of: $($Choices -join ', ')" -ForegroundColor Yellow
  }
}

function Read-CommaList {
  param(
    [string]$Prompt,
    [string[]]$Default = @()
  )

  $defaultText = if ($Default.Count -gt 0) { $Default -join ', ' } else { '' }
  $value = Read-Host ($(if ($defaultText) { "$Prompt [$defaultText]" } else { $Prompt }))
  if ([string]::IsNullOrWhiteSpace($value)) {
    return @($Default)
  }
  return @(
    $value.Split(',') |
      ForEach-Object { $_.Trim() } |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
      Select-Object -Unique
  )
}

function Get-AsciiSlug {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ''
  }

  $slug = $Value.Trim().ToLowerInvariant()
  $slug = [System.Text.RegularExpressions.Regex]::Replace($slug, '[^a-z0-9]+', '-')
  $slug = $slug.Trim('-')
  $slug = [System.Text.RegularExpressions.Regex]::Replace($slug, '-{2,}', '-')
  return $slug
}

function Write-JsonNoBom {
  param(
    [string]$Path,
    [object]$Data
  )

  $directory = Split-Path -Parent $Path
  if (-not [string]::IsNullOrWhiteSpace($directory)) {
    [System.IO.Directory]::CreateDirectory($directory) | Out-Null
  }

  $json = $Data | ConvertTo-Json -Depth 100
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $json, $encoding)
}

function New-InteractiveSpec {
  $defaultDescription = 'Draft course scaffold generated from tools/init-new-course.ps1'

  Write-Host ''
  Write-Host 'Course Identity' -ForegroundColor Cyan
  $courseNameTh = Read-RequiredText 'Course name (Thai)'
  $courseNameEn = Read-RequiredText 'Course name (English)'
  $defaultCourseId = Get-AsciiSlug $courseNameEn
  while ([string]::IsNullOrWhiteSpace($defaultCourseId)) {
    $courseNameEn = Read-RequiredText 'Course name (English, include ASCII words to derive course_id)'
    $defaultCourseId = Get-AsciiSlug $courseNameEn
  }

  $courseId = Read-RequiredText 'course_id' $defaultCourseId
  $courseShortName = Read-RequiredText 'Short course name' $courseNameEn
  $instructor = Read-RequiredText 'Instructor or teaching team'
  $description = Read-RequiredText 'Course description' $defaultDescription
  $brandIcon = Read-OptionalText 'Brand icon' '∞'
  $accent = Read-RequiredText 'Primary accent hex color' '#22d3ee'
  $accentSecondary = Read-RequiredText 'Secondary accent hex color' '#8b5cf6'
  $lessonXp = Read-IntegerValue 'Lesson completion XP' 40

  Write-Host ''
  Write-Host 'Features' -ForegroundColor Cyan
  $useResources = Read-YesNo 'Enable resources page?' $true
  $useMissions = Read-YesNo 'Enable missions page?' $true
  $useGames = Read-YesNo 'Enable games feature flag?' $false

  Write-Host ''
  Write-Host 'CLOs' -ForegroundColor Cyan
  $cloCount = Read-IntegerValue 'How many CLOs?' 2
  $clos = @()
  for ($index = 1; $index -le $cloCount; $index += 1) {
    Write-Host ''
    Write-Host "CLO $index" -ForegroundColor DarkCyan
    $cloId = Read-RequiredText 'CLO id' "CLO$index"
    $label = Read-RequiredText 'CLO label'
    $bloom = Read-ChoiceValue 'Bloom level' @('Remember','Understand','Apply','Analyze','Evaluate','Create') 'Apply'
    $tags = Read-CommaList 'Assessment tags (comma separated)' @('draft')

    $clos += [ordered]@{
      id = $cloId
      label = $label
      bloom = $bloom
      assessment_tags = @($tags)
    }
  }

  $availableCloIds = @($clos | ForEach-Object { $_.id })

  Write-Host ''
  Write-Host 'Modules' -ForegroundColor Cyan
  $moduleCount = Read-IntegerValue 'How many modules in the first scaffold?' 2
  $modules = @()
  $allWidgets = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  $widgetCatalog = @(
    'graph-explorer',
    'parameter-playground',
    'quick-check',
    'definition-visualizer',
    'proof-unpack',
    'step-sequence',
    'sbra-sequence'
  )

  for ($index = 1; $index -le $moduleCount; $index += 1) {
    Write-Host ''
    Write-Host "Module $index" -ForegroundColor DarkCyan
    $title = Read-RequiredText 'Module title'
    $derivedSlug = Get-AsciiSlug $title
    if ([string]::IsNullOrWhiteSpace($derivedSlug)) {
      $derivedSlug = Read-RequiredText 'Module slug (required because title is not ASCII-friendly)'
    }
    $moduleSlug = Read-RequiredText 'Module slug' $derivedSlug
    $moduleId = Read-RequiredText 'Module id' $moduleSlug
    $summary = Read-RequiredText 'Module summary' "Draft module for $title"
    $moduleKind = Read-ChoiceValue 'Module kind' @('concept','application','proof') ($(if ($index % 2 -eq 0) { 'proof' } else { 'concept' }))
    $defaultWidgets = if ($moduleKind -eq 'proof') {
      @('definition-visualizer', 'proof-unpack', 'quick-check')
    } elseif ($moduleKind -eq 'application') {
      @('parameter-playground', 'quick-check', 'step-sequence')
    } else {
      @('quick-check', 'parameter-playground')
    }

    Write-Host "Available CLO ids: $($availableCloIds -join ', ')" -ForegroundColor DarkGray
    $moduleClos = Read-CommaList 'Module CLO ids (comma separated)' @($availableCloIds[0])

    Write-Host "Available widgets: $($widgetCatalog -join ', ')" -ForegroundColor DarkGray
    $moduleWidgets = Read-CommaList 'Module widgets (comma separated)' $defaultWidgets
    foreach ($widget in $moduleWidgets) {
      [void]$allWidgets.Add($widget)
    }

    $modules += [ordered]@{
      id = $moduleId
      slug = $moduleSlug
      title = $title
      summary = $summary
      clo_ids = @($moduleClos)
      module_kind = $moduleKind
      widgets = @($moduleWidgets)
    }
  }

  if ($useMissions) {
    [void]$allWidgets.Add('sbra-sequence')
  }

  Write-Host ''
  Write-Host 'Resources' -ForegroundColor Cyan
  $resourceCount = Read-IntegerValue 'How many starter resources?' 0
  $resources = @()
  for ($index = 1; $index -le $resourceCount; $index += 1) {
    Write-Host ''
    Write-Host "Resource $index" -ForegroundColor DarkCyan
    $title = Read-RequiredText 'Resource title'
    $type = Read-ChoiceValue 'Resource type' @('file','note','link') 'note'
    $topic = Read-RequiredText 'Resource topic' $modules[0].title
    $description = Read-RequiredText 'Resource description' "Draft resource for $title"
    $resourceIdDefault = Get-AsciiSlug $title
    if ([string]::IsNullOrWhiteSpace($resourceIdDefault)) {
      $resourceIdDefault = "resource-$index"
    }
    $resourceId = Read-RequiredText 'Resource id' $resourceIdDefault

    $resource = [ordered]@{
      id = $resourceId
      topic = $topic
      title = $title
      description = $description
      type = $type
    }

    if ($type -eq 'file') {
      $pathDefault = "files/$resourceId.md"
      $resource.path = Read-RequiredText 'Resource path (relative to <course-dir>/resources/)' $pathDefault
      $resource.body = Read-OptionalText 'Inline file body (single line or leave blank)' ''
    } elseif ($type -eq 'note') {
      $resource.body = Read-RequiredText 'Note body'
    } elseif ($type -eq 'link') {
      $resource.url = Read-RequiredText 'Link URL'
    }

    $resources += $resource
  }

  $widgetsEnabled = @($allWidgets)
  if ($widgetsEnabled.Count -eq 0) {
    $widgetsEnabled = @('quick-check')
  }

  return [ordered]@{
    course_id = $courseId
    course_name_th = $courseNameTh
    course_name_en = $courseNameEn
    course_short_name = $courseShortName
    instructor = $instructor
    description = $description
    theme = [ordered]@{
      brand_icon = $brandIcon
      accent = $accent
      accent_secondary = $accentSecondary
    }
    features = [ordered]@{
      resources = $useResources
      missions = $useMissions
      games = $useGames
    }
    widgets_enabled = @($widgetsEnabled)
    lesson_completion_xp = $lessonXp
    clos = @($clos)
    modules = @($modules)
    resources = @($resources)
  }
}

Write-Host 'init-new-course.ps1' -ForegroundColor Cyan
Write-Host "Spec output: $specOutPath"
if ([string]::IsNullOrWhiteSpace($courseDir)) {
  Write-Host 'Course dir:  (auto -> courses/<course_id>)'
} else {
  Write-Host "Course dir:  $courseDir"
}

if ($UseExample) {
  Write-Host 'Using built-in example spec.' -ForegroundColor DarkGray
  $exampleJson = & $node $initScript --example
  $spec = $exampleJson | ConvertFrom-Json
} else {
  $spec = New-InteractiveSpec
}

Write-Host ''
Write-Host 'Writing spec file...' -ForegroundColor Cyan
Write-JsonNoBom -Path $specOutPath -Data $spec
Write-Host "Saved spec to $specOutPath" -ForegroundColor Green

if ([string]::IsNullOrWhiteSpace($courseDir)) {
  $courseDir = [System.IO.Path]::GetFullPath((Join-Path $repoRoot ("courses\" + $spec.course_id)))
  Write-Host "Resolved course dir: $courseDir" -ForegroundColor DarkGray
}

Write-Host ''
Write-Host 'Validating spec...' -ForegroundColor Cyan
& $node $validateScript --spec $specOutPath

if ($LASTEXITCODE -ne 0) {
  throw "Spec validation failed for $specOutPath"
}

if ($NoScaffold) {
  Write-Host ''
  Write-Host 'Skipping scaffold because -NoScaffold was provided.' -ForegroundColor Yellow
  return
}

$shouldScaffold = Read-YesNo 'Scaffold course files now?' $true
if (-not $shouldScaffold) {
  Write-Host 'Stopped after validation. You can scaffold later with tools/init-new-course.mjs.' -ForegroundColor Yellow
  return
}

$initArgs = @($initScript, '--spec', $specOutPath, '--course-dir', $courseDir)
if ($Force) {
  $initArgs += '--force'
}

Write-Host ''
Write-Host 'Running scaffold...' -ForegroundColor Cyan
& $node @initArgs

if ($LASTEXITCODE -ne 0) {
  throw "Scaffold failed for $specOutPath"
}

Write-Host ''
Write-Host 'Scaffold complete.' -ForegroundColor Green
Write-Host 'Next suggested commands:' -ForegroundColor Cyan
$relativeCourseDir = Resolve-Path -LiteralPath $courseDir | ForEach-Object {
  $_.Path.Substring($repoRoot.Length).TrimStart('\')
}
Write-Host "  node tools/build-course.mjs --course-dir $relativeCourseDir"
Write-Host "  node tools/validate-course.mjs --course-dir $relativeCourseDir"
Write-Host "  node tools/validate-course.mjs --course-dir $relativeCourseDir --check-output"
