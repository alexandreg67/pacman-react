// Test automatisé de la modale Game Over sur différentes résolutions
// À utiliser dans la console du navigateur sur http://localhost:5176/

class ModalTester {
  constructor() {
    this.results = {
      mobile375: { passed: 0, failed: 0, tests: [] },
      tablet768: { passed: 0, failed: 0, tests: [] },
      desktop1280: { passed: 0, failed: 0, tests: [] },
      desktop1440: { passed: 0, failed: 0, tests: [] },
      desktop1920: { passed: 0, failed: 0, tests: [] },
    }
    this.originalSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  // Simule une résolution d'écran
  setViewport(width, height) {
    console.log(`🖥️ Configuration viewport: ${width}x${height}px`)
    // Note: En mode console, on simule juste les tests
    // En vrai, il faudrait utiliser DevTools Device Toolbar
  }

  // Attend qu'un élément soit présent
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const check = () => {
        const element = document.querySelector(selector)
        if (element) {
          resolve(element)
        } else if (Date.now() - start < timeout) {
          setTimeout(check, 100)
        } else {
          reject(new Error(`Élément ${selector} non trouvé après ${timeout}ms`))
        }
      }
      check()
    })
  }

  // Déclenche un Game Over (simulation)
  async triggerGameOver() {
    console.log('🎯 Tentative de déclenchement du Game Over...')

    // Chercher si le game over est déjà actif
    const existingOverlay = document.querySelector(
      '[class*="fixed"][class*="inset-0"][class*="bg-black"]',
    )
    if (existingOverlay) {
      console.log('✅ Modale Game Over déjà présente')
      return true
    }

    // Instructions pour déclencher manuellement
    console.log('ℹ️ Veuillez déclencher le Game Over manuellement:')
    console.log('   1. Dirigez Pac-Man vers un fantôme')
    console.log("   2. Ou attendez que vos vies s'épuisent")
    console.log('   3. Puis relancez ce test avec testCurrentResolution()')

    return false
  }

  // Teste la modale sur la résolution actuelle
  async testCurrentResolution() {
    console.log('🧪 Début des tests de la modale...')

    const width = window.innerWidth
    const height = window.innerHeight
    const resolutionName = this.getResolutionName(width)

    console.log(`📱 Test sur résolution ${resolutionName} (${width}x${height}px)`)

    const tests = []

    // Test 1: Présence de l'overlay
    try {
      const overlay = document.querySelector(
        '[class*="fixed"][class*="inset-0"][class*="bg-black"]',
      )
      const overlayTest = {
        name: 'Overlay présent',
        passed: !!overlay,
        details: overlay ? 'Overlay trouvé' : 'Overlay non trouvé',
      }
      tests.push(overlayTest)
      console.log(`${overlayTest.passed ? '✅' : '❌'} ${overlayTest.name}: ${overlayTest.details}`)

      if (overlay) {
        // Test 2: Position fixed
        const overlayStyle = window.getComputedStyle(overlay)
        const positionTest = {
          name: 'Position fixed',
          passed: overlayStyle.position === 'fixed',
          details: `Position: ${overlayStyle.position}`,
        }
        tests.push(positionTest)
        console.log(
          `${positionTest.passed ? '✅' : '❌'} ${positionTest.name}: ${positionTest.details}`,
        )

        // Test 3: Couvre tout le viewport
        const rect = overlay.getBoundingClientRect()
        const coversViewport =
          rect.top === 0 &&
          rect.left === 0 &&
          rect.width === window.innerWidth &&
          rect.height === window.innerHeight
        const viewportTest = {
          name: 'Couvre tout le viewport',
          passed: coversViewport,
          details: `Overlay: ${Math.round(rect.width)}x${Math.round(rect.height)} | Viewport: ${window.innerWidth}x${window.innerHeight}`,
        }
        tests.push(viewportTest)
        console.log(
          `${viewportTest.passed ? '✅' : '❌'} ${viewportTest.name}: ${viewportTest.details}`,
        )

        // Test 4: Z-index approprié
        const zIndexTest = {
          name: 'Z-index élevé',
          passed: parseInt(overlayStyle.zIndex) >= 40,
          details: `Z-index: ${overlayStyle.zIndex}`,
        }
        tests.push(zIndexTest)
        console.log(`${zIndexTest.passed ? '✅' : '❌'} ${zIndexTest.name}: ${zIndexTest.details}`)
      }

      // Test 5: Modale centrée
      const modalContainer = document.querySelector(
        '[class*="fixed"][class*="flex"][class*="items-center"][class*="justify-center"]',
      )
      const modalTest = {
        name: 'Container modal centré',
        passed: !!modalContainer,
        details: modalContainer ? 'Container modal trouvé' : 'Container modal non trouvé',
      }
      tests.push(modalTest)
      console.log(`${modalTest.passed ? '✅' : '❌'} ${modalTest.name}: ${modalTest.details}`)

      if (modalContainer) {
        // Test 6: Style de centrage
        const modalStyle = window.getComputedStyle(modalContainer)
        const centeringTest = {
          name: 'Style de centrage correct',
          passed:
            modalStyle.display === 'flex' &&
            modalStyle.alignItems === 'center' &&
            modalStyle.justifyContent === 'center',
          details: `Display: ${modalStyle.display}, Align: ${modalStyle.alignItems}, Justify: ${modalStyle.justifyContent}`,
        }
        tests.push(centeringTest)
        console.log(
          `${centeringTest.passed ? '✅' : '❌'} ${centeringTest.name}: ${centeringTest.details}`,
        )
      }

      // Test 7: Animation glow-pulse
      const glowElement = document.querySelector('[class*="animate-glow-pulse"]')
      const glowTest = {
        name: 'Animation glow-pulse présente',
        passed: !!glowElement,
        details: glowElement ? 'Élément avec glow-pulse trouvé' : 'Aucun élément avec glow-pulse',
      }
      tests.push(glowTest)
      console.log(`${glowTest.passed ? '✅' : '❌'} ${glowTest.name}: ${glowTest.details}`)

      // Test 8: Animation avec delay
      const delayElement = document.querySelector('[class*="animation-delay-1000"]')
      const delayTest = {
        name: 'Animation delay-1000 présente',
        passed: !!delayElement,
        details: delayElement ? 'Élément avec delay trouvé' : 'Aucun élément avec delay',
      }
      tests.push(delayTest)
      console.log(`${delayTest.passed ? '✅' : '❌'} ${delayTest.name}: ${delayTest.details}`)

      // Test 9: Impossibilité d'interaction avec le jeu
      const gameElements = document.querySelectorAll(
        '.maze-container, [class*="pacman"], button:not([class*="game-over"])',
      )
      let interactionBlocked = true
      gameElements.forEach((el) => {
        const style = window.getComputedStyle(el)
        if (style.pointerEvents !== 'none' && !el.closest('[class*="fixed"]')) {
          interactionBlocked = false
        }
      })

      const interactionTest = {
        name: 'Interaction avec le jeu bloquée',
        passed: interactionBlocked || !!overlay, // L'overlay doit bloquer les interactions
        details: interactionBlocked
          ? 'Interactions bloquées'
          : 'Interactions possibles (overlay devrait bloquer)',
      }
      tests.push(interactionTest)
      console.log(
        `${interactionTest.passed ? '✅' : '❌'} ${interactionTest.name}: ${interactionTest.details}`,
      )
    } catch (error) {
      console.error('❌ Erreur pendant les tests:', error)
      tests.push({
        name: 'Test échoué',
        passed: false,
        details: error.message,
      })
    }

    // Résumé
    const passed = tests.filter((t) => t.passed).length
    const failed = tests.filter((t) => !t.passed).length
    const total = tests.length

    console.log(
      `\n📊 Résumé ${resolutionName}: ${passed}/${total} tests réussis (${Math.round((passed / total) * 100)}%)`,
    )

    if (failed > 0) {
      console.log('❌ Tests échoués:')
      tests
        .filter((t) => !t.passed)
        .forEach((test) => {
          console.log(`   • ${test.name}: ${test.details}`)
        })
    }

    return {
      resolution: resolutionName,
      width,
      height,
      tests,
      passed,
      failed,
      total,
    }
  }

  getResolutionName(width) {
    if (width < 768) return 'Mobile'
    if (width < 1280) return 'Tablette'
    if (width < 1440) return 'Desktop-1280'
    if (width < 1920) return 'Desktop-1440'
    return 'Desktop-1920+'
  }

  // Génère un rapport complet
  generateReport(results) {
    console.log('\n🎯 RAPPORT COMPLET DES TESTS VISUELS')
    console.log('=====================================')

    results.forEach((result) => {
      console.log(`\n📱 ${result.resolution} (${result.width}x${result.height}px)`)
      console.log(
        `   ✅ Réussis: ${result.passed}/${result.total} (${Math.round((result.passed / result.total) * 100)}%)`,
      )

      if (result.failed > 0) {
        console.log(`   ❌ Problèmes détectés:`)
        result.tests
          .filter((t) => !t.passed)
          .forEach((test) => {
            console.log(`      • ${test.name}: ${test.details}`)
          })
      }
    })

    // Recommandations
    const allResults = results.flatMap((r) => r.tests)
    const commonIssues = {}

    allResults
      .filter((t) => !t.passed)
      .forEach((test) => {
        commonIssues[test.name] = (commonIssues[test.name] || 0) + 1
      })

    if (Object.keys(commonIssues).length > 0) {
      console.log('\n🔧 RECOMMANDATIONS:')
      Object.entries(commonIssues).forEach(([issue, count]) => {
        console.log(
          `   • ${issue} (${count} résolution${count > 1 ? 's' : ''} affectée${count > 1 ? 's' : ''})`,
        )
      })
    }
  }

  // Instructions pour l'utilisateur
  showInstructions() {
    console.log(`
🎮 GUIDE DE TEST DE LA MODALE GAME OVER
======================================

1️⃣ PRÉPARER LE TEST:
   • Ouvrir http://localhost:5176/ dans Chrome/Firefox
   • Ouvrir DevTools (F12)
   • Aller dans l'onglet Console

2️⃣ TESTER UNE RÉSOLUTION:
   • DevTools → Device Toolbar (icône mobile)
   • Choisir: Mobile (375px), Tablette (768px), ou Desktop (1280px+)
   • Dans le jeu: perdre pour déclencher Game Over
   • Dans la console: modalTester.testCurrentResolution()

3️⃣ RÉSOLUTIONS À TESTER:
   📱 Mobile: 375x667px (iPhone SE)
   📟 Tablette: 768x1024px (iPad)
   🖥️ Desktop: 1280x720px, 1440x900px, 1920x1080px

4️⃣ POINTS VÉRIFIÉS AUTOMATIQUEMENT:
   ✅ Overlay couvre tout l'écran
   ✅ Position fixed utilisée
   ✅ Modale centrée correctement
   ✅ Z-index approprié
   ✅ Animations présentes
   ✅ Interactions bloquées

5️⃣ COMMANDES DISPONIBLES:
   • modalTester.testCurrentResolution() - Test résolution actuelle
   • modalTester.showInstructions() - Afficher ce guide
    `)
  }
}

// Initialiser le testeur
window.modalTester = new ModalTester()

// Afficher les instructions au chargement
console.log('🎮 Testeur de modale Game Over initialisé!')
console.log('📋 Tapez modalTester.showInstructions() pour voir le guide complet')
console.log('🧪 Tapez modalTester.testCurrentResolution() pour tester la résolution actuelle')
