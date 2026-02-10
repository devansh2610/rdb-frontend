/* eslint-disable cypress/no-unnecessary-waiting */
describe('First Test', () => {
  it('Test 1 for verification of Title(positive)', () => {
    //cy is root modeule in cypress used for serving different queries in spec file
    // cy.visit('https://cosylab.iiitd.edu.in/dashboard/signup')
    cy.visit('http://localhost:3000/dashboard')
    //title() is a method which should return a value which we need to compare it 
    // with the actual value(title of web page)
    cy.title().should("eq", "CoSyLab API dashboard")
  })

  it('Test 2 for verification of Title(negative)', function() {
    // cy.visit('https://cosylab.iiitd.edu.in/dashboard/signup')
    cy.visit('http://localhost:3000/dashboard')
    cy.title().should("eq", "CoSyLab API dashboard2")
  })

  it('Test 3 scrolling through the website', function() {
    cy.visit('http://localhost:3000/dashboard')
    cy.wait(2000)
    cy.contains('Login').scrollIntoView()
    cy.wait(2000)
  })
  it('Test 4 (Testing About button)', () => {
    cy.visit('http://localhost:3000/dashboard')
    cy.xpath('//a[text()="About"]').click()
  })

})