import styled from "@emotion/styled";
import { memo, useCallback, type ReactElement } from "react";

type PreAlphaWarningDialogProps = {
	onAccept: () => void;
};

const Overlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
	backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
	background: #ffffff;
	border: 2px solid #f59e0b;
	border-radius: 12px;
	padding: 32px;
	max-width: 600px;
	width: 90%;
	box-sizing: border-box;
	box-shadow:
		0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const Title = styled.h1`
	color: #d97706;
	font-size: 28px;
	font-weight: 700;
	margin: 0 0 24px 0;
	display: flex;
	align-items: center;
	gap: 12px;
`;

const WarningIcon = styled.span`
	font-size: 32px;
`;

const Content = styled.div`
	color: #1f2937;
	font-size: 16px;
	line-height: 1.8;
	margin-bottom: 24px;
`;

const List = styled.ul`
	margin: 16px 0;
	padding-left: 24px;
	color: #b45309;
`;

const ListItem = styled.li`
	margin: 8px 0;
	color: #374151;
`;

const Button = styled.button`
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	color: #ffffff;
	border: none;
	border-radius: 8px;
	padding: 14px 32px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	width: 100%;
	box-sizing: border-box;
	transition: all 0.2s ease;

	&:hover {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
	}

	&:active {
		transform: translateY(0);
	}
`;

const Footer = styled.div`
	margin-top: 24px;
	padding-top: 24px;
	border-top: 1px solid #e5e7eb;
	color: #6b7280;
	font-size: 14px;
	text-align: center;
`;

const PreAlphaWarningDialogComponent = ({
	onAccept,
}: PreAlphaWarningDialogProps): ReactElement => {
	const handleAccept = useCallback(() => {
		onAccept();
	}, [onAccept]);

	return (
		<Overlay>
			<Dialog>
				<Title>
					<WarningIcon>⚠️</WarningIcon>
					Pre-Alpha Version Notice
				</Title>

				<Content>
					<p>
						<strong>Important:</strong> This is a pre-alpha version of the
						application.
					</p>

					<List>
						<ListItem>
							<strong>No compatibility guarantee:</strong> Future updates may
							not be compatible with current data formats or features.
						</ListItem>
						<ListItem>
							<strong>Bugs expected:</strong> You may encounter significant bugs
							and unexpected behavior.
						</ListItem>
						<ListItem>
							<strong>Data loss possible:</strong> Do not use for critical work.
							Always keep backups.
						</ListItem>
						<ListItem>
							<strong>Frequent changes:</strong> Features may be added,
							modified, or removed without notice.
						</ListItem>
					</List>

					<p>
						By clicking &ldquo;I Understand&rdquo; below, you acknowledge these
						limitations and agree to use this application at your own risk.
					</p>
				</Content>

				<Button type="button" onClick={handleAccept}>
					I Understand and Accept
				</Button>

				<Footer>
					This warning can be accessed anytime from the Help menu.
				</Footer>
			</Dialog>
		</Overlay>
	);
};

export const PreAlphaWarningDialog = memo(PreAlphaWarningDialogComponent);
