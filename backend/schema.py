import graphene # type: ignore
from graphene_sqlalchemy import SQLAlchemyObjectType# type: ignore
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity# type: ignore
from models import User, Lead, Activity, Note, Tag, LeadTag, db
from sqlalchemy.sql import func# type: ignore
from datetime import datetime
import os
from google.generativeai import GenerativeModel, configure# type: ignore
from sendgrid import SendGridAPIClient# type: ignore
from sendgrid.helpers.mail import Mail# type: ignore

# Configure Gemini API
configure(api_key="AIzaSyDqxbID4YBbRnVrVMfvuAgRLAyrjG-hs48")

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
if not SENDGRID_API_KEY:
    raise Exception("SendGrid API key not configured")
sendgrid_client = SendGridAPIClient(SENDGRID_API_KEY)


class UserType(SQLAlchemyObjectType):
    class Meta:
        model = User
        only_fields = ('id', 'email', 'credits', 'created_at')

class LeadType(SQLAlchemyObjectType):
    class Meta:
        model = Lead
        only_fields = ('id', 'user_id', 'name', 'email', 'status', 'created_at', 'tags')
    tags = graphene.List(lambda: TagType)

    def resolve_tags(self, info):
        return self.tags

class ActivityType(SQLAlchemyObjectType):
    class Meta:
        model = Activity
        only_fields = ('id', 'user_id', 'action', 'created_at')

class NoteType(SQLAlchemyObjectType):
    class Meta:
        model = Note
        only_fields = ('id', 'lead_id', 'user_id', 'content', 'created_at')

class TagType(SQLAlchemyObjectType):
    class Meta:
        model = Tag
        only_fields = ('id', 'user_id', 'name', 'created_at')

class PipelineMetricsType(graphene.ObjectType):
    status = graphene.String()
    lead_count = graphene.Int()
    conversion_rate = graphene.Float()
    avg_time_in_stage = graphene.Float()

class RegisterInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)

class LeadInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    email = graphene.String(required=True)
    status = graphene.String()
    tag_ids = graphene.List(graphene.ID)

class NoteInput(graphene.InputObjectType):
    content = graphene.String(required=True)

class TagInput(graphene.InputObjectType):
    name = graphene.String(required=True)

class ChatbotInput(graphene.InputObjectType):
    query = graphene.String(required=True)

class LoginInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)

class EmailInput(graphene.InputObjectType):
    lead_id = graphene.ID(required=True)
    subject = graphene.String(required=True)
    body = graphene.String(required=True)


class EmailMutation(graphene.Mutation):
    class Arguments:
        input = EmailInput(required=True)

    success = graphene.Boolean()

    @jwt_required()
    def mutate(self, info, input):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=input.lead_id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        if not SENDGRID_API_KEY:
            raise Exception("Email service not configured")

        try:
            message = Mail(
                from_email='no-reply@klientel.app',
                to_emails=lead.email,
                subject=input.subject,
                html_content=input.body
            )
            response = sendgrid_client.send(message)
            if response.status_code not in (200, 202):
                raise Exception(f"Failed to send email: Status {response.status_code}")
            
            activity = Activity(
                user_id=user_id,
                action=f"Sent email to lead {lead.name}: {input.subject}"
            )
            db.session.add(activity)
            db.session.commit()
            return EmailMutation(success=True)
        except Exception as e:
            raise Exception(f"Failed to send email: {str(e)}")


class RegisterMutation(graphene.Mutation):
    class Arguments:
        input = RegisterInput(required=True)
    
    user = graphene.Field(UserType)
    access_token = graphene.String()

    def mutate(self, info, input):
        if User.query.filter_by(email=input.email).first():
            raise Exception("Email already exists")
        user = User(email=input.email, credits=50)
        user.set_password(input.password)
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=str(user.id))
        return RegisterMutation(user=user, access_token=access_token)

class LoginMutation(graphene.Mutation):
    class Arguments:
        input = LoginInput(required=True)  

    user = graphene.Field(UserType)
    access_token = graphene.String()

    def mutate(self, info, input):
        user = User.query.filter_by(email=input.email).first()
        if not user or not user.check_password(input.password):
            raise Exception("Invalid credentials")
        access_token = create_access_token(identity=str(user.id))
        return LoginMutation(user=user, access_token=access_token)

class CreateLeadMutation(graphene.Mutation):
    class Arguments:
        input = LeadInput(required=True)

    lead = graphene.Field(LeadType)

    @jwt_required()
    def mutate(self, info, input):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if user.credits < 1:
            raise Exception("Insufficient credits")
        lead = Lead(
            user_id=user_id,
            name=input.name,
            email=input.email,
            status=input.status or "New",
        )
        db.session.add(lead)
        if input.tag_ids:
            tags = Tag.query.filter(Tag.id.in_(input.tag_ids), Tag.user_id == user_id).all()
            if len(tags) != len(input.tag_ids):
                raise Exception("One or more tags not found")
            for tag in tags:
                lead_tag = LeadTag(lead_id=lead.id, tag_id=tag.id)
                db.session.add(lead_tag)
                db.session.add(Activity(user_id=user_id, action=f"Added tag {tag.name} to lead {input.name}"))
        user.credits -= 1
        activity = Activity(user_id=user_id, action=f"Created lead: {input.name}")
        db.session.add(activity)
        db.session.commit()
        return CreateLeadMutation(lead=lead)

class UpdateLeadMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = LeadInput(required=True)

    lead = graphene.Field(LeadType)

    @jwt_required()
    def mutate(self, info, id, input):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        old_status = lead.status
        lead.name = input.name
        lead.email = input.email
        lead.status = input.status or lead.status
        action = f"Updated lead: {input.name}"
        if old_status != lead.status:
            action += f"; Changed status from {old_status} to {lead.status}"
        
        # Update tags
        if input.tag_ids is not None:
            current_tags = {tag.id for tag in lead.tags}
            new_tags = set(input.tag_ids)
            tags_to_add = new_tags - current_tags
            tags_to_remove = current_tags - new_tags
            for tag_id in tags_to_add:
                tag = Tag.query.filter_by(id=tag_id, user_id=user_id).first()
                if not tag:
                    raise Exception(f"Tag with ID {tag_id} not found")
                db.session.add(LeadTag(lead_id=lead.id, tag_id=tag_id))
                db.session.add(Activity(user_id=user_id, action=f"Added tag {tag.name} to lead {lead.name}"))
            for tag_id in tags_to_remove:
                tag = Tag.query.filter_by(id=tag_id, user_id=user_id).first()
                if tag:
                    db.session.query(LeadTag).filter_by(lead_id=lead.id, tag_id=tag_id).delete()
                    db.session.add(Activity(user_id=user_id, action=f"Removed tag {tag.name} from lead {lead.name}"))
        
        activity = Activity(user_id=user_id, action=action)
        db.session.add(activity)
        db.session.commit()
        return UpdateLeadMutation(lead=lead)

class DeleteLeadMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @jwt_required()
    def mutate(self, info, id):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        activity = Activity(user_id=user_id, action=f"Deleted lead: {lead.name}")
        db.session.add(activity)
        db.session.delete(lead)
        db.session.commit()
        return DeleteLeadMutation(success=True)

class CreateNoteMutation(graphene.Mutation):
    class Arguments:
        lead_id = graphene.ID(required=True)
        input = NoteInput(required=True)

    note = graphene.Field(NoteType)

    @jwt_required()
    def mutate(self, info, lead_id, input):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=lead_id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        note = Note(
            lead_id=lead_id,
            user_id=user_id,
            content=input.content,
        )
        activity = Activity(user_id=user_id, action=f"Added note to lead: {lead.name}")
        db.session.add(note)
        db.session.add(activity)
        db.session.commit()
        return CreateNoteMutation(note=note)

class DeleteNoteMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @jwt_required()
    def mutate(self, info, id):
        user_id = int(get_jwt_identity())
        note = Note.query.filter_by(id=id, user_id=user_id).first()
        if not note:
            raise Exception("Note not found")
        lead = Lead.query.filter_by(id=note.lead_id, user_id=user_id).first()
        activity = Activity(user_id=user_id, action=f"Deleted note from lead: {lead.name}")
        db.session.add(activity)
        db.session.delete(note)
        db.session.commit()
        return DeleteNoteMutation(success=True)

class CreateTagMutation(graphene.Mutation):
    class Arguments:
        input = TagInput(required=True)

    tag = graphene.Field(TagType)

    @jwt_required()
    def mutate(self, info, input):
        user_id = int(get_jwt_identity())
        if Tag.query.filter_by(user_id=user_id, name=input.name).first():
            raise Exception("Tag already exists")
        tag = Tag(user_id=user_id, name=input.name)
        db.session.add(tag)
        db.session.add(Activity(user_id=user_id, action=f"Created tag: {input.name}"))
        db.session.commit()
        return CreateTagMutation(tag=tag)

class DeleteTagMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @jwt_required()
    def mutate(self, info, id):
        user_id = int(get_jwt_identity())
        tag = Tag.query.filter_by(id=id, user_id=user_id).first()
        if not tag:
            raise Exception("Tag not found")
        db.session.add(Activity(user_id=user_id, action=f"Deleted tag: {tag.name}"))
        db.session.delete(tag)
        db.session.commit()
        return DeleteTagMutation(success=True)

class AssignTagToLeadMutation(graphene.Mutation):
    class Arguments:
        lead_id = graphene.ID(required=True)
        tag_id = graphene.ID(required=True)

    lead = graphene.Field(LeadType)

    @jwt_required()
    def mutate(self, info, lead_id, tag_id):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=lead_id, user_id=user_id).first()
        tag = Tag.query.filter_by(id=tag_id, user_id=user_id).first()
        if not lead or not tag:
            raise Exception("Lead or tag not found")
        if tag in lead.tags:
            raise Exception("Tag already assigned to lead")
        lead_tag = LeadTag(lead_id=lead_id, tag_id=tag_id)
        db.session.add(lead_tag)
        db.session.add(Activity(user_id=user_id, action=f"Added tag {tag.name} to lead {lead.name}"))
        db.session.commit()
        return AssignTagToLeadMutation(lead=lead)

class RemoveTagFromLeadMutation(graphene.Mutation):
    class Arguments:
        lead_id = graphene.ID(required=True)
        tag_id = graphene.ID(required=True)

    lead = graphene.Field(LeadType)

    @jwt_required()
    def mutate(self, info, lead_id, tag_id):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=lead_id, user_id=user_id).first()
        tag = Tag.query.filter_by(id=tag_id, user_id=user_id).first()
        if not lead or not tag:
            raise Exception("Lead or tag not found")
        if tag not in lead.tags:
            raise Exception("Tag not assigned to lead")
        db.session.query(LeadTag).filter_by(lead_id=lead_id, tag_id=tag_id).delete()
        db.session.add(Activity(user_id=user_id, action=f"Removed tag {tag.name} from lead {lead.name}"))
        db.session.commit()
        return RemoveTagFromLeadMutation(lead=lead)

class ChatbotMutation(graphene.Mutation):
    class Arguments:
        input = ChatbotInput(required=True)

    response = graphene.String()

    @jwt_required()
    def mutate(self, info, input):
        user_id = int(get_jwt_identity())
        KLIENTEL_INFO = """
        Klientel is a modern CRM solution designed to streamline lead management, pipeline tracking, and analytics. Features include:
        - Lead Management: Create, update, and delete leads with name, email, and status (New, Contacted, Qualified, Closed).
        - Pipeline Tracking: Visualize lead progression through stages with a Kanban-style board.
        - Analytics: View metrics like lead count, conversion rates, and average time in each stage.
        - Recent Activities: Track user actions like creating/updating/deleting leads and adding/deleting notes.
        - Notes: Add and manage notes for individual leads.
        - Command+K Search: Quickly navigate to leads, notes, or pages (dashboard, pipelines, analytics).
        - Tags: Assign custom tags to leads for better organization.
        The dashboard displays leads, recent activities, and analytics. Users must sign in to access the dashboard.
        """

        recent_activities = Activity.query.filter_by(user_id=user_id).order_by(Activity.created_at.desc()).limit(10).all()
        activities_text = '\n'.join([f"{activity.action} at {activity.created_at.strftime('%Y-%m-%d %H:%M:%S')}" for activity in recent_activities]) or "No recent activities available."

        prompt = f"""
        You are KlientelBot, a minimalistic AI assistant for Klientel, a modern CRM platform. Answer queries concisely and accurately in a friendly, futuristic tone based on the following information:

        {KLIENTEL_INFO}

        Recent Activities:
        {activities_text}

        User Query: {input.query}

        If the query is unrelated to Klientel, politely redirect to Klientel-related topics.
        """

        try:
            model = GenerativeModel('gemini-1.5-flash')
            result = model.generate_content(prompt)
            response_text = result.text
            return ChatbotMutation(response=response_text)
        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")

class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    leads = graphene.List(LeadType)
    activities = graphene.List(ActivityType, limit=graphene.Int(default_value=10))
    pipeline_metrics = graphene.List(PipelineMetricsType)
    notes = graphene.List(NoteType, lead_id=graphene.ID(required=True))
    tags = graphene.List(TagType)
    leads_by_tags = graphene.List(LeadType, tag_ids=graphene.List(graphene.ID))

    @jwt_required()
    def resolve_me(self, info):
        user_id = get_jwt_identity()
        return User.query.get(user_id)

    @jwt_required()
    def resolve_leads(self, info):
        user_id = get_jwt_identity()
        return Lead.query.filter_by(user_id=user_id).all()

    @jwt_required()
    def resolve_activities(self, info, limit):
        user_id = get_jwt_identity()
        return Activity.query.filter_by(user_id=user_id).order_by(Activity.created_at.desc()).limit(limit).all()

    @jwt_required()
    def resolve_pipeline_metrics(self, info):
        user_id = get_jwt_identity()
        stages = ['New', 'Contacted', 'Qualified', 'Closed']
        metrics = []

        lead_counts = (
            Lead.query.filter_by(user_id=user_id)
            .group_by(Lead.status)
            .with_entities(Lead.status, func.count(Lead.id).label('count'))
            .all()
        )
        lead_count_dict = {status: count for status, count in lead_counts}

        for i, status in enumerate(stages):
            count = lead_count_dict.get(status, 0)
            conversion_rate = 0.0
            if i < len(stages) - 1:
                next_status = stages[i + 1]
                current_count = lead_count_dict.get(status, 0)
                next_count = lead_count_dict.get(next_status, 0)
                conversion_rate = (next_count / current_count * 100) if current_count > 0 else 0.0

            avg_time = 0.0
            status_changes = (
                Activity.query.filter_by(user_id=user_id)
                .filter(Activity.action.contains(f"Changed status to {status}"))
                .all()
            )
            if status_changes:
                total_days = 0
                count_changes = 0
                for change in status_changes:
                    lead_id = change.action.split('lead: ')[1].split(';')[0]
                    next_changes = (
                        Activity.query.filter_by(user_id=user_id)
                        .filter(Activity.created_at > change.created_at)
                        .filter(
                            (Activity.action.contains(f"Changed status from {status}")) |
                            (Activity.action.contains(f"Deleted lead: {lead_id}"))
                        )
                        .order_by(Activity.created_at.asc())
                        .first()
                    )
                    if next_changes:
                        time_diff = (next_changes.created_at - change.created_at).total_seconds() / (60 * 60 * 24)
                        total_days += time_diff
                        count_changes += 1
                avg_time = total_days / count_changes if count_changes > 0 else 0.0

            metrics.append({
                'status': status,
                'lead_count': count,
                'conversion_rate': round(conversion_rate, 2),
                'avg_time_in_stage': round(avg_time, 2),
            })

        return [PipelineMetricsType(**metric) for metric in metrics]

    @jwt_required()
    def resolve_notes(self, info, lead_id):
        user_id = get_jwt_identity()
        return Note.query.filter_by(lead_id=lead_id, user_id=user_id).order_by(Note.created_at.desc()).all()

    @jwt_required()
    def resolve_tags(self, info):
        user_id = get_jwt_identity()
        return Tag.query.filter_by(user_id=user_id).all()

    @jwt_required()
    def resolve_leads_by_tags(self, info, tag_ids):
        user_id = get_jwt_identity()
        query = Lead.query.filter_by(user_id=user_id)
        if tag_ids:
            query = query.join(LeadTag).filter(LeadTag.tag_id.in_(tag_ids))
        return query.all()

class Mutation(graphene.ObjectType):
    register = RegisterMutation.Field()
    login = LoginMutation.Field()
    createLead = CreateLeadMutation.Field()
    updateLead = UpdateLeadMutation.Field()
    deleteLead = DeleteLeadMutation.Field()
    createNote = CreateNoteMutation.Field()
    deleteNote = DeleteNoteMutation.Field()
    createTag = CreateTagMutation.Field()
    deleteTag = DeleteTagMutation.Field()
    assignTagToLead = AssignTagToLeadMutation.Field()
    removeTagFromLead = RemoveTagFromLeadMutation.Field()
    sendEmail = EmailMutation.Field()
    chatbot = ChatbotMutation.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)