// PrivacyPolicyModal.js
import React from 'react';

function PrivacyPolicyModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          padding: '25px',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '800',
            color: '#333'
          }}>Privacy Policy</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
              padding: '0',
              width: '30px',
              height: '30px'
            }}
          >×</button>
        </div>

        <div style={{
          padding: '25px',
          overflowY: 'auto',
          flex: 1,
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#555'
        }}>
          <p><strong>Tranzio.com</strong> including online platform(s), its mobile application/web applications owned by the Company ('Website') recognizes the importance of maintaining your privacy. Tranzio.com is committed to maintain the confidentiality, integrity and security of all information of our users. This Privacy Policy describes how Tranzio.com collects and handles certain information it may collect and/or receive from you via the use of this Website. Please see below for details on what type of information we may collect from you, how that information is used in connection with the services offered through our Website and relevant information shared with our authorized business partners only for the purpose of policy solicitation process, pre/post-sale servicing, claim servicing and providing you any other services as permissible under applicable laws. This Privacy Policy applies to current and former visitors to our Website, our customers and POSP agents. By visiting and/or using our Website, you agree to this Privacy Policy.</p>

          <p>This Privacy Policy is published in compliance of: the Information Technology Act, 2000; and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Information) Rules, 2011 (the "SPDI Rules") as amended from time to time.</p>

          <p>By using the Tranzio.com and/or registering yourself at www.tranzio.com, you authorize Tranzio Insurance Brokers Private Limited (including its authorized representatives and its business partners) (Tranzio/Company) to contact you via email or phone call or sms and offer you our services for the product you have opted for, imparting product knowledge, offer promotional offers running on the Website and offers by its authorized business partners and associated third parties (to the extent permissible), for which reasons your information may be collected in the manner as detailed under this Policy. You hereby agree that you authorize Tranzio.com to contact you for the above mentioned purposes even if you have registered yourself under DND or DNC or NCPR service(s). Your authorization, in this regard, shall be valid as long as your account is not deactivated by either you or us.</p>

          <h3 style={{ color: '#4d6cff', marginTop: '20px' }}>Controllers of Personal Information</h3>
          <p>Your personal data will be stored and collected by Tranzio Insurance Brokers Private Limited.</p>

          <h3 style={{ color: '#4d6cff' }}>Purposes of collection of your data</h3>
          <p>Tranzio.com collects your information when you register for an account, when you use its products or services, visit its Website's pages or when an employer organization shares its employee information. When you register with Tranzio.com, you are asked for submitting certain information which may be personal to you such as first name, last name, state and city of residence, email address, mobile number, date of birth, financial, know your customer and medical records etc. Once you register at the Website and sign in you are not anonymous to us. Also, you are asked for your contact number during registration and may be sent SMSs, notifications about our services to your wireless device. Hence, by registering you authorize the Tranzio.com to send texts and email alerts to you with your login details and any other service requirements, including promotional mails and SMSs.</p>

          <p>We use your information in order to:</p>
          <ul>
            <li>respond to queries or requests submitted by you.</li>
            <li>process orders or applications submitted by you.</li>
            <li>administer or otherwise carry out our obligations in relation to any agreement with our authorized business partners in connection with our business operations and functions for the purpose of insurance solicitation, providing pre/post sale services, claims servicing and providing you any other services as permissible under applicable laws.</li>
            <li>anticipate and resolve problems with any services supplied to you.</li>
            <li>offer group insurance cover and wellness corner offerings / health and wellness related information to your employer organization.</li>
            <li>to send you information about promotions or offers from Insurance Companies to the extent permissible under applicable laws. We might also tell you about new features or products.</li>
            <li>to make our website and the services offered better. We may combine information we get from you with information about you we get from our business partners or third parties as permissible under applicable laws.</li>
            <li>to send you notices, communications, offer alerts relevant to your use of the Services offered on this Website.</li>
            <li>Third parties and outsourced entities for the reasons consistent with the purposes for which the information was collected and/or other purposes as per applicable law.</li>
            <li>Where we need to comply with a legal obligation as per applicable legal and regulatory framework.</li>
            <li>as otherwise provided in this Privacy Policy.</li>
          </ul>
          <p>Some features of this Website or our Services will require you to furnish your personally identifiable information as provided by you under your account section on our Website.</p>

          <h3 style={{ color: '#4d6cff' }}>Information Sharing and Disclosure</h3>
          <p>We may share your Information submitted on the Website to any third party/service provider/business partner without obtaining your prior consent in the following limited circumstances:</p>
          <ol>
            <li>When it is requested or required by law or by any court or governmental agency or authority to disclose, for the purpose of verification of identity, or for the prevention, detection, investigation including cyber incidents, or for prosecution and punishment of offences. These disclosures are made in good faith and belief that such disclosure is reasonably necessary for enforcing these Terms and Conditions; for complying with the applicable laws and regulations.</li>
            <li>Tranzio shall transfer information about you in case Tranzio is acquired by or merged with another company.</li>
            <li>Where we need to comply with a legal obligation as per applicable legal and regulatory framework.</li>
          </ol>

          <h3 style={{ color: '#4d6cff' }}>We Collect Cookies</h3>
          <p>A cookie is a piece of data stored on the user's computer tied to information about the user. We may use both session ID cookies and persistent cookies. For session ID cookies, once you close your browser or log out, the cookie terminates and is erased. A persistent cookie is a small text file stored on your computer's hard drive for an extended period of time. Session ID cookies may be used by PRP to track user preferences while the user is visiting the website. They also help to minimize load times and save on server processing. Persistent cookies may be used by PRP to store whether, for example, you want your password remembered or not, and other information. Cookies used on the PRP website do not contain personally identifiable information.</p>

          <h3 style={{ color: '#4d6cff' }}>Log Files</h3>
          <p>Like most standard websites, we use log files. This information may include internet protocol (IP) addresses, browser type, internet service provider (ISP), referring/exit pages, platform type, date/time stamp, and number of clicks to analyze trends, administer the site, track user's movement in the aggregate, and gather broad demographic information for aggregate use. We may combine this automatically collected log information with other information we collect about you. We do this to improve services we offer to you, to improve marketing, analytics or site functionality.</p>

          <h3 style={{ color: '#4d6cff' }}>Email- Opt out</h3>
          <p>If you are no longer interested in receiving e-mail announcements and other marketing information from us, please e-mail your request at: care@tranzio.com. Please note that it may take about 10 days to process your request.</p>

          <h3 style={{ color: '#4d6cff' }}>Security</h3>
          <p>We employ appropriate technical and organizational security measures at all times to protect the information we collect from you. We use multiple electronic, procedural, and physical security measures to protect against unauthorized or unlawful use or alteration of information, and against any accidental loss, destruction, or damage to information. However, no method of transmission over the Internet, or method of electronic storage, is 100% secure. Therefore, we cannot guarantee its absolute security. Further, you are responsible for maintaining the confidentiality and security of your login id and password, and may not provide these credentials to any third party.</p>

          <h3 style={{ color: '#4d6cff' }}>ISO 27001</h3>
          <p>ISO/IEC 27001:2013 is the international standard for management of information security and provides a systematic approach to keep sensitive company information secure. Getting the ISO 27001:2013 certificate is a reassurance for our customers that Tranzio.com complies with the highest standards regarding information security. Tranzio is ISO/IEC 27001:2013 certified company. We have implemented the ISO/IEC 27001: 2013 standard for all processes supporting the development and delivery of services by Tranzio.com. Tranzio.com understands that the confidentiality, integrity, and availability of your information are vital to our business operations and our own success.</p>

          <h3 style={{ color: '#4d6cff' }}>Links to Other Websites</h3>
          <p>There might be other sites linked to Tranzio.com. Personal information that you provide to those sites are not our property. These affiliated sites may have different privacy practices and we encourage you to read their privacy policies of these website when you visit them.</p>

          <h3 style={{ color: '#4d6cff' }}>Changes in this Privacy Policy</h3>
          <p>Tranzio.com reserves the right to change this policy from time to time, at its sole discretion. We may update this privacy policy to reflect changes to our information practices. We encourage you to periodically review this page for the latest information on our privacy practices.</p>

          <h3 style={{ color: '#4d6cff' }}>Data Grievance Officer</h3>
          <p>In case you have any grievances with respect to in accordance with applicable law on Information Technology and rules made there under, the name and contact details of the Grievance Officer are provided below:</p>
          <p>
            <strong>Name:</strong> Data Protection Officer<br />
            <strong>Email:</strong> dpo@tranzio.com<br />
            <strong>Phone:</strong> 1800-XXX-XXXX<br />
            <strong>Address:</strong> Tranzio Insurance Brokers Private Limited, [Company Address]
          </p>

          <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#777' }}>
            <strong>Last Updated:</strong> December 2024
          </p>
        </div>

        <div style={{
          padding: '20px 25px',
          borderTop: '2px solid #e0e0e0',
          background: 'white',
          position: 'sticky',
          bottom: 0
        }}>
          <button
            onClick={onAccept}
            style={{
              width: '100%',
              padding: '15px',
              background: '#4d6cff',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#3a56cc'}
            onMouseOut={(e) => e.target.style.background = '#4d6cff'}
          >
            I Accept the Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyModal;